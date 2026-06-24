from flask import Flask, request, jsonify, send_file, render_template
import pandas as pd
import os, uuid, math, zipfile, io

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = None

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

ALLOWED = {'.csv', '.xlsx', '.xls', '.tsv'}

def read_file(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == '.csv':
        return pd.read_csv(path, low_memory=False)
    elif ext == '.tsv':
        return pd.read_csv(path, sep='\t', low_memory=False)
    elif ext in ('.xlsx', '.xls'):
        return pd.read_excel(path)
    raise ValueError(f"Unsupported format: {ext}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/merge', methods=['POST'])
def merge():
    files = request.files.getlist('files')
    if len(files) < 2:
        return jsonify({'error': 'Upload at least 2 files'}), 400
    dfs = []
    for f in files:
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in ALLOWED:
            return jsonify({'error': f'Unsupported file: {f.filename}'}), 400
        tmp = os.path.join(UPLOAD_FOLDER, f'{uuid.uuid4()}{ext}')
        f.save(tmp)
        dfs.append(read_file(tmp))
        os.remove(tmp)
    merged = pd.concat(dfs, ignore_index=True)
    out_name = f'merged_{uuid.uuid4().hex[:8]}.csv'
    out_path = os.path.join(OUTPUT_FOLDER, out_name)
    merged.to_csv(out_path, index=False)
    return jsonify({'success': True, 'rows': len(merged), 'columns': len(merged.columns), 'file': out_name})

@app.route('/api/split', methods=['POST'])
def split():
    f = request.files.get('file')
    chunk_size = int(request.form.get('chunk_size', 10000))
    split_by = request.form.get('split_by', 'rows')
    parts = int(request.form.get('parts', 2))
    if not f:
        return jsonify({'error': 'No file uploaded'}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in ALLOWED:
        return jsonify({'error': 'Unsupported file type'}), 400
    tmp = os.path.join(UPLOAD_FOLDER, f'{uuid.uuid4()}{ext}')
    f.save(tmp)
    df = read_file(tmp)
    os.remove(tmp)
    total_rows = len(df)
    if split_by == 'parts':
        chunk_size = math.ceil(total_rows / parts)
    chunks = [df[i:i+chunk_size] for i in range(0, total_rows, chunk_size)]
    base = os.path.splitext(f.filename)[0]
    zip_name = f'split_{uuid.uuid4().hex[:8]}.zip'
    zip_path = os.path.join(OUTPUT_FOLDER, zip_name)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for i, chunk in enumerate(chunks, 1):
            buf = io.StringIO()
            chunk.to_csv(buf, index=False)
            zf.writestr(f'{base}_part{i}.csv', buf.getvalue())
    return jsonify({'success': True, 'total_rows': total_rows, 'parts': len(chunks), 'file': zip_name})

@app.route('/api/download/<filename>')
def download(filename):
    path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
