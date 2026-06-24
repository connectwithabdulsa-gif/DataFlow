from datetime import datetime
from pathlib import Path
import io
import math
import os
import uuid
import zipfile

import pandas as pd
from flask import Flask, jsonify, render_template, request, send_file


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "outputs"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = None

UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)

ALLOWED = {".csv", ".xlsx", ".xls", ".tsv"}

SITE = {
    "name": "Data Flow",
    "tagline": "A polished workspace for merging, splitting, and downloading data files.",
    "description": "Clean file workflows for CSV, TSV, XLSX, and XLS uploads.",
    "repo_url": "https://github.com/connectwithabdulsa-gif/DataFlow",
}

ADSENSE_CLIENT_ID = os.environ.get("ADSENSE_CLIENT_ID", "").strip()
ADSENSE_HOME_SLOT_ID = os.environ.get("ADSENSE_HOME_SLOT_ID", "").strip()
ADSENSE_ENABLED_PAGES = {"home", "about", "terms", "contact"}

NAV = [
    {"label": "Tools", "href": "/#tools"},
    {"label": "How it works", "href": "/#how-it-works"},
    {"label": "About", "href": "/about"},
    {"label": "Privacy", "href": "/privacy"},
    {"label": "Terms", "href": "/terms"},
    {"label": "Contact", "href": "/contact"},
]

HOME_PAGE = {
    "eyebrow": "File workflow studio",
    "title": "Merge spreadsheets, split exports, and keep the process tidy.",
    "intro": (
        "Data Flow is designed like a real product, not a quick demo. "
        "Upload spreadsheet files, combine them into one clean CSV, or split a large file "
        "into smaller parts without fighting the interface."
    ),
    "highlights": [
        "CSV, TSV, XLSX, XLS",
        "Temporary server-side processing",
        "Download-ready outputs",
        "No account required",
    ],
    "stats": [
        {"value": "4", "label": "Supported formats"},
        {"value": "2", "label": "Core workflows"},
        {"value": "1", "label": "Download per result"},
    ],
    "feature_cards": [
        {
            "title": "Fast merge flow",
            "text": "Stack multiple files into one dataset and export the result as a CSV in a single step.",
        },
        {
            "title": "Split with control",
            "text": "Break large files into row-based chunks or split them into a chosen number of parts.",
        },
        {
            "title": "Clean outputs",
            "text": "Generated files are organized and downloadable through stable links after processing.",
        },
    ],
    "workflow_steps": [
        {
            "step": "01",
            "title": "Upload",
            "text": "Choose compatible files from your computer and send them to the tool.",
        },
        {
            "step": "02",
            "title": "Process",
            "text": "Select merge or split, then let the backend create the output file.",
        },
        {
            "step": "03",
            "title": "Download",
            "text": "Grab the generated CSV or ZIP using a direct download link.",
        },
    ],
    "tips": [
        "Keep column names consistent when merging related files.",
        "Use row-based splitting when you want evenly sized exports.",
        "Choose parts-based splitting when downstream tools expect a fixed number of files.",
        "Review the output before publishing it or sharing it with a team.",
    ],
    "editorial_cards": [
        {
            "title": "Before you merge",
            "text": "Match headers, check date formats, and make sure the files belong to the same workflow.",
        },
        {
            "title": "Before you split",
            "text": "Decide whether your next step cares about row count or a fixed number of output files.",
        },
        {
            "title": "Before you publish",
            "text": "Verify the final CSV, keep a clean source copy, and add a privacy page before turning on ads.",
        },
    ],
    "faq": [
        {
            "q": "What file types are supported?",
            "a": "CSV, TSV, XLSX, and XLS files are supported for both merge and split workflows.",
        },
        {
            "q": "Are uploads stored permanently?",
            "a": "No. Temporary uploads are saved only long enough to process the request and then removed.",
        },
        {
            "q": "Can I split by rows or by parts?",
            "a": "Yes. The split tool supports either rows per file or a fixed number of output parts.",
        },
        {
            "q": "Is this site ready for advertising?",
            "a": "The layout includes dedicated About, Privacy, Terms, and Contact pages so it looks like a proper publisher site.",
        },
    ],
}

CONTENT_PAGES = {
    "about": {
        "title": "About Data Flow",
        "subtitle": "A focused file workflow tool with a cleaner, more publishable presentation.",
        "sections": [
            {
                "heading": "What Data Flow does",
                "paragraphs": [
                    "Data Flow helps people combine spreadsheet exports, split oversized files, and download tidy results without leaving the browser.",
                    "It is built to feel like a genuine product with clear navigation, trust content, and policy pages that support a public site.",
                ],
            },
            {
                "heading": "Who it is for",
                "paragraphs": [
                    "The tool is useful for operations teams, analysts, founders, creators, and anyone who needs a simple data handoff workflow.",
                    "It is intentionally lightweight and avoids unnecessary distractions so the actual file task stays front and center.",
                ],
            },
        ],
    },
    "privacy": {
        "title": "Privacy Policy",
        "subtitle": "How file uploads, downloads, and site data are handled.",
        "sections": [
            {
                "heading": "Temporary file handling",
                "paragraphs": [
                    "Uploaded files are written to temporary storage only while the requested merge or split job runs.",
                    "Temporary input files are removed after processing. Generated output files remain available for download from the service until they are cleaned up by the hosting platform or overwritten by later output.",
                ],
            },
            {
                "heading": "Logs and diagnostics",
                "paragraphs": [
                    "The hosting platform may retain operational logs, request metadata, and build diagnostics for reliability and security.",
                    "We do not ask you to create an account to use the tool, and we do not need personal profile information to process files.",
                ],
            },
            {
                "heading": "Advertising",
                "paragraphs": [
                    "This site is being prepared for advertising support through Google AdSense. If ads are enabled, the site may use cookies or similar technologies used by the ad provider to serve and measure ads.",
                    "Visitors can review ad preferences in Google Ads Settings or use browser-based privacy controls and opt-out tools where available.",
                ],
            },
        ],
    },
    "terms": {
        "title": "Terms of Use",
        "subtitle": "Basic expectations for using Data Flow responsibly.",
        "sections": [
            {
                "heading": "Acceptable use",
                "paragraphs": [
                    "Use the service only with files you are allowed to process and share.",
                    "Do not upload malware, copyrighted files you do not have permission to use, or data that you are not authorized to handle.",
                ],
            },
            {
                "heading": "Output review",
                "paragraphs": [
                    "You are responsible for reviewing generated files before sharing them with customers, teammates, or the public.",
                    "The service is provided as-is and may be updated, rate limited, or changed without notice as the project evolves.",
                ],
            },
            {
                "heading": "Availability",
                "paragraphs": [
                    "The live site depends on Railway hosting and GitHub source control.",
                    "If the app is offline for maintenance or deployment work, the underlying files can still be edited in the repository and redeployed.",
                ],
            },
        ],
    },
    "contact": {
        "title": "Contact",
        "subtitle": "A simple way to reach the project and report issues.",
        "sections": [
            {
                "heading": "GitHub issues",
                "paragraphs": [
                    "The best current support channel is the repository issue tracker.",
                    "Use it for bug reports, feature ideas, and deployment notes that should stay attached to the codebase.",
                ],
            },
            {
                "heading": "Repository",
                "paragraphs": [
                    "Source, release history, and deployment changes are all tracked in the public GitHub repository.",
                    "That keeps the project easy to audit and easier to improve over time.",
                ],
            },
        ],
        "cta": {
            "label": "Open GitHub repo",
            "href": SITE["repo_url"],
        },
    },
}


def read_file(path):
    ext = Path(path).suffix.lower()
    if ext == ".csv":
        return pd.read_csv(path, low_memory=False)
    if ext == ".tsv":
        return pd.read_csv(path, sep="\t", low_memory=False)
    if ext in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    raise ValueError(f"Unsupported format: {ext}")


def render_page(page_key):
    return render_template(
        "index.html",
        site=SITE,
        nav=NAV,
        page_key=page_key,
        page=HOME_PAGE if page_key == "home" else CONTENT_PAGES[page_key],
        current_year=datetime.utcnow().year,
        adsense={
            "client_id": ADSENSE_CLIENT_ID,
            "home_slot_id": ADSENSE_HOME_SLOT_ID,
            "enabled": bool(ADSENSE_CLIENT_ID) and page_key in ADSENSE_ENABLED_PAGES,
            "show_home_unit": bool(ADSENSE_CLIENT_ID and ADSENSE_HOME_SLOT_ID and page_key == "home"),
        },
    )


@app.context_processor
def inject_globals():
    return {
        "site": SITE,
        "nav": NAV,
        "current_year": datetime.utcnow().year,
        "adsense": {
            "client_id": ADSENSE_CLIENT_ID,
            "home_slot_id": ADSENSE_HOME_SLOT_ID,
            "enabled": bool(ADSENSE_CLIENT_ID),
        },
    }


@app.route("/")
def index():
    return render_page("home")


@app.route("/about")
def about():
    return render_page("about")


@app.route("/privacy")
def privacy():
    return render_page("privacy")


@app.route("/terms")
def terms():
    return render_page("terms")


@app.route("/contact")
def contact():
    return render_page("contact")


@app.route("/api/merge", methods=["POST"])
def merge():
    files = request.files.getlist("files")
    if len(files) < 2:
        return jsonify({"error": "Upload at least 2 files"}), 400

    dfs = []
    for f in files:
        ext = Path(f.filename).suffix.lower()
        if ext not in ALLOWED:
            return jsonify({"error": f"Unsupported file: {f.filename}"}), 400
        tmp = UPLOAD_FOLDER / f"{uuid.uuid4()}{ext}"
        f.save(tmp)
        try:
            dfs.append(read_file(tmp))
        finally:
            if tmp.exists():
                tmp.unlink()

    try:
        merged = pd.concat(dfs, ignore_index=True)
    except Exception as exc:
        return jsonify({"error": f"Could not merge files: {exc}"}), 400

    out_name = f"merged_{uuid.uuid4().hex[:8]}.csv"
    out_path = OUTPUT_FOLDER / out_name
    merged.to_csv(out_path, index=False)
    return jsonify(
        {
            "success": True,
            "rows": int(len(merged)),
            "columns": int(len(merged.columns)),
            "file": out_name,
        }
    )


@app.route("/api/split", methods=["POST"])
def split():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "No file uploaded"}), 400

    ext = Path(f.filename).suffix.lower()
    if ext not in ALLOWED:
        return jsonify({"error": "Unsupported file type"}), 400

    try:
        chunk_size = int(request.form.get("chunk_size", 10000))
        parts = int(request.form.get("parts", 2))
    except ValueError:
        return jsonify({"error": "Chunk size and parts must be numbers"}), 400

    split_by = request.form.get("split_by", "rows")
    if chunk_size < 1:
        return jsonify({"error": "Chunk size must be at least 1"}), 400
    if parts < 2:
        return jsonify({"error": "Parts must be at least 2"}), 400

    tmp = UPLOAD_FOLDER / f"{uuid.uuid4()}{ext}"
    f.save(tmp)
    try:
        df = read_file(tmp)
    finally:
        if tmp.exists():
            tmp.unlink()

    total_rows = len(df)
    if total_rows == 0:
        return jsonify({"error": "File has no rows to split"}), 400

    if split_by == "parts":
        chunk_size = max(1, math.ceil(total_rows / parts))

    chunks = [df[i : i + chunk_size] for i in range(0, total_rows, chunk_size)]
    base = Path(f.filename).stem
    zip_name = f"split_{uuid.uuid4().hex[:8]}.zip"
    zip_path = OUTPUT_FOLDER / zip_name

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, chunk in enumerate(chunks, 1):
            buf = io.StringIO()
            chunk.to_csv(buf, index=False)
            zf.writestr(f"{base}_part{i}.csv", buf.getvalue())

    return jsonify(
        {
            "success": True,
            "total_rows": int(total_rows),
            "parts": len(chunks),
            "file": zip_name,
        }
    )


@app.route("/api/download/<filename>")
def download(filename):
    path = (OUTPUT_FOLDER / filename).resolve()
    if OUTPUT_FOLDER.resolve() not in path.parents and path != OUTPUT_FOLDER.resolve():
        return jsonify({"error": "Invalid file path"}), 400
    if not path.exists():
        return jsonify({"error": "File not found"}), 404
    return send_file(path, as_attachment=True)


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "Uploaded file is too large"}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
