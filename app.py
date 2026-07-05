import os
import sqlite3
import random
import string
import requests
import json
import pandas as pd
from datetime import datetime
from flask import Flask, render_template, request, jsonify, Response, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()

app = Flask(__name__)
CORS(app)

# SQLite Databases Paths
FEEDBACK_DB = "feedback.db"
DOCUMENTS_DB = "documents.db"

# Helper function to get database connection
def get_db_connection(db_name):
    conn = sqlite3.connect(db_name)
    conn.row_factory = sqlite3.Row
    return conn

# Automatically initialize all required database tables on startup
def init_databases():
    # 1. Feedback Database
    conn = sqlite3.connect(FEEDBACK_DB)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            academic_year TEXT NOT NULL,
            location TEXT NOT NULL,
            problem_description TEXT NOT NULL,
            solution_suggestion TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

    # 2. Documents Database
    conn = sqlite3.connect(DOCUMENTS_DB)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            key TEXT PRIMARY KEY,
            template_1 TEXT NOT NULL,
            template_2 TEXT NOT NULL,
            template_3 TEXT NOT NULL,
            style_1 TEXT NOT NULL,
            style_2 TEXT NOT NULL,
            style_3 TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Initialize databases
init_databases()

# Helper to generate random keys for documents
def generate_random_key(length=8):
    letters_and_digits = string.ascii_lowercase + string.digits
    return ''.join(random.choice(letters_and_digits) for i in range(length))

# Centralized Gemini API call using standard HTTP requests for ultimate reliability
def call_gemini_api(prompt, system_instruction=None, response_schema=None):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please set it as an environment variable.")

    # We use gemini-3.5-flash which is widely supported, fast and cost-effective
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }

    # Prepare standard Gemini request payload
    contents_part = {"text": prompt}
    payload = {
        "contents": [{"parts": [contents_part]}]
    }

    # Add system instruction if provided
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    # Set response format structure if schema is defined
    if response_schema:
        payload["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseSchema": response_schema
        }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Gemini API request failed: {response.status_code} - {response.text}")

    result_json = response.json()
    try:
        text_response = result_json["candidates"][0]["content"]["parts"][0]["text"]
        return text_response
    except (KeyError, IndexError) as e:
        raise Exception(f"Failed to parse text from Gemini response payload: {str(e)}")


# -------------------------------------------------------------
# FRONT-END TEMPLATE ROUTES
# -------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/excel_maker")
def excel_maker():
    return render_template("excel_maker.html")

@app.route("/survey_admin")
def survey_admin():
    return render_template("survey_admin.html")

@app.route("/pdf_maker")
def pdf_maker():
    return render_template("pdf_maker.html")

@app.route("/expired")
def expired():
    return render_template("expired.html")


# -------------------------------------------------------------
# API ROUTE ENDPOINTS
# -------------------------------------------------------------

# Submit campus feedback survey anonymously
@app.route("/submit_survey", methods=["POST"])
def submit_survey():
    academic_year = request.json.get("academic_year")
    location = request.json.get("location")
    problem_description = request.json.get("problem_description")
    solution_suggestion = request.json.get("solution_suggestion", "")

    if not academic_year or not location or not problem_description:
        return jsonify({"error": "All primary fields are required"}), 400

    try:
        conn = get_db_connection(FEEDBACK_DB)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (academic_year, location, problem_description, solution_suggestion) VALUES (?, ?, ?, ?)",
            (academic_year, location, problem_description, solution_suggestion)
        )
        conn.commit()
        conn.close()
        return jsonify({"response": "successful"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get all surveys / feedback
@app.route("/fetch_survey", methods=["GET"])
def fetch_survey():
    try:
        conn = get_db_connection(FEEDBACK_DB)
        rows = conn.execute("SELECT * FROM feedback ORDER BY id DESC").fetchall()
        conn.close()

        surveys = [dict(row) for row in rows]
        return jsonify(surveys)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Parse raw unstructured input text and download as Excel workbook
@app.route("/get_excel_data", methods=["POST"])
def get_excel_data():
    raw_text = request.json.get("raw_text")
    headers_prompt = request.json.get("headers")

    if not raw_text or not headers_prompt:
        return jsonify({"error": "Missing raw text or column schema prompt."}), 400

    try:
        system_instructions = (
            "You are an expert data entry and ETL processing system. Convert the raw text provided "
            "by the user into a clean structured table matching their requested columns. Your output "
            "must contain ONLY standard CSV data (comma separated values). Do NOT wrap the result in "
            "backticks or provide introductory/concluding explanations. Begin directly with the CSV header row."
        )

        user_prompt = f"Target Columns: {headers_prompt}\n\nRaw Text Data:\n{raw_text}"
        
        # Call Gemini to get structured CSV data
        csv_output = call_gemini_api(user_prompt, system_instruction=system_instructions)
        
        # Parse the output CSV lines
        csv_lines = [line.strip() for line in csv_output.strip().split("\n") if line.strip()]
        if not csv_lines:
            raise ValueError("AI failed to output a parsable spreadsheet format.")

        # Structure headers and rows cleanly using a standard pandas dataframe
        data_rows = []
        for line in csv_lines:
            # Basic quoted comma split
            import csv
            parsed_line = next(csv.reader([line]))
            data_rows.append(parsed_line)

        if len(data_rows) < 1:
            raise ValueError("No rows found in generated table.")

        headers = data_rows[0]
        body = data_rows[1:] if len(data_rows) > 1 else []

        df = pd.DataFrame(body, columns=headers)

        # Write out to Excel format (.xlsx) in memory using io.BytesIO
        import io
        output_buffer = io.BytesIO()
        with pd.ExcelWriter(output_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name="Parsed Data")
        
        excel_bytes = output_buffer.getvalue()

        safe_name = headers_prompt.split(",")[0].strip().replace(" ", "_").lower() or "data"
        filename = f"vlx_parsed_{safe_name}.xlsx"

        return Response(
            excel_bytes,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        )

    except Exception as e:
        print("Excel Generation Failure:", str(e))
        return jsonify({"error": f"Failed to structure data: {str(e)}"}), 500


# Document template creator using Gemini AI
@app.route("/doc_maker", methods=["POST"])
def doc_maker():
    form_data = request.json
    doc_type = form_data.get("document_type")

    if not doc_type:
        return jsonify({"error": "Document type is required."}), 400

    try:
        # Stringify details for Gemini model to absorb
        details_list = []
        for key, value in form_data.items():
            if key != "document_type" and value:
                clean_key = key.replace("letter_", "").replace("memo_", "").replace("agreement_", "").replace("receipt_", "").replace("report_", "").replace("proposal_", "").replace("certificate_", "").replace("list_", "")
                details_list.append(f"{clean_key.upper()}: {value}")
        
        details_context = "\n".join(details_list)

        system_instructions = (
            "You are an elite, senior typography developer and full-stack template layout expert. "
            "You write highly polished, self-contained HTML templates styled with professional inline "
            "CSS (inside <style> blocks) suitable for printing or PDF exports in A4 sizing. "
            "IMPORTANT: All monetary values, prices, budgets, or costs in the generated document "
            "MUST be formatted and displayed using the Nigerian Naira currency symbol (₦) instead of other symbols like $."
        )

        prompt = f"""
Generate exactly 3 distinct stylistic visual HTML templates for an official {doc_type.upper()} document using the inputs below.
Each template must be a completely valid, standalone, highly styled HTML document (including <html>, <head>, <style>, <body>) containing headers, beautiful letterheads, content layout structure, tracking, clear grids/borders, custom color palettes, and signature grids as appropriate.

Include the exact phrase 'Made with VLX Tools, Powered by TechLite' subtly and professionally styled in the footer of each option.

You MUST generate 3 options matching these visual design moods:
1. 'Executive Professional' - Sleek corporate letterhead layout, dark navy/slate accents, formal typography.
2. 'Creative Modern' - Modern asymmetrical spacing, stylish divider elements (charcoal and teal/emerald accents).
3. 'Minimalist Editorial' - Graceful high-contrast classic serif styling, ample negative space, elegant borders.

Input Fields Context:
{details_context}

Return your complete response in strict JSON matching this exact structure:
{{
  "style_1": "Executive Professional",
  "template_1": "...Full, complete self-contained HTML document string 1...",
  "style_2": "Creative Modern",
  "template_2": "...Full, complete self-contained HTML document string 2...",
  "style_3": "Minimalist Editorial",
  "template_3": "...Full, complete self-contained HTML document string 3..."
}}
"""

        # Set strict JSON schema to force Gemini to output matching structural fields
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "style_1": {"type": "STRING"},
                "template_1": {"type": "STRING"},
                "style_2": {"type": "STRING"},
                "template_2": {"type": "STRING"},
                "style_3": {"type": "STRING"},
                "template_3": {"type": "STRING"}
            },
            "required": ["style_1", "template_1", "style_2", "template_2", "style_3", "template_3"]
        }

        # Query Gemini model
        ai_response_text = call_gemini_api(prompt, system_instruction=system_instructions, response_schema=response_schema)
        parsed_templates = json.loads(ai_response_text)

        # Store in Document SQL DB
        doc_key = generate_random_key()
        conn = get_db_connection(DOCUMENTS_DB)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO documents (key, template_1, template_2, template_3, style_1, style_2, style_3)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            doc_key,
            parsed_templates["template_1"],
            parsed_templates["template_2"],
            parsed_templates["template_3"],
            parsed_templates["style_1"],
            parsed_templates["style_2"],
            parsed_templates["style_3"]
        ))
        conn.commit()
        conn.close()

        return jsonify({
            "response": "successful",
            "key": doc_key
        })

    except Exception as e:
        print("Doc Maker failure:", str(e))
        return jsonify({"error": f"Failed to generate templates: {str(e)}"}), 500


# Render interactive preview frame
@app.route("/view_doc/<key>")
def view_doc(key):
    try:
        conn = get_db_connection(DOCUMENTS_DB)
        row = conn.execute("SELECT * FROM documents WHERE key = ?", (key,)).fetchone()
        conn.close()

        if not row:
            return redirect(url_for("expired"))

        doc = dict(row)
        return render_template(
            "doc_viewer.html",
            key=key,
            style_1=doc["style_1"],
            style_2=doc["style_2"],
            style_3=doc["style_3"],
            template_1=doc["template_1"],
            template_2=doc["template_2"],
            template_3=doc["template_3"]
        )
    except Exception as e:
        print("View Doc failure:", str(e))
        return redirect(url_for("expired"))


# Download clean raw HTML structure or prompt print
@app.route("/download_doc/<key>/<subkey>")
def download_doc(key, subkey):
    try:
        conn = get_db_connection(DOCUMENTS_DB)
        row = conn.execute("SELECT * FROM documents WHERE key = ?", (key,)).fetchone()
        conn.close()

        if not row:
            return redirect(url_for("expired"))

        doc = dict(row)
        
        # Subkey mappings: 1, 2, or 3
        template_field = f"template_{subkey}"
        style_field = f"style_{subkey}"

        if template_field not in doc:
            return redirect(url_for("expired"))

        html_content = doc[template_field]
        style_name = doc[style_field].lower().replace(" ", "_")

        filename = f"vlx_doc_{style_name}_{key}.html"

        return Response(
            html_content,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "text/html"
            }
        )
    except Exception as e:
        print("Download Doc failure:", str(e))
        return redirect(url_for("expired"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
