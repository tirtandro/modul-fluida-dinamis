from flask import Flask, render_template, request, jsonify, session, g
import os
import sqlite3
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24) # For session management

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

DATABASE = 'database.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nis TEXT UNIQUE,
                nama TEXT,
                kelas TEXT,
                role TEXT DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Create progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS progress (
                user_id INTEGER PRIMARY KEY,
                last_page TEXT,
                last_materi_slide INTEGER,
                updated_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        # Create quiz_scores table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                score INTEGER,
                total INTEGER,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        db.commit()

# Initialize DB on startup
init_db()


@app.route('/')
def index():
    return render_template('index.html')


# ==========================================
# AUTHENTICATION API
# ==========================================
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    nis = data.get('nis', '').strip()
    nama = data.get('nama', '').strip()
    kelas = data.get('kelas', '').strip()

    # Check if admin
    if nis == 'admin' and nama == 'guru123':
        session['user_id'] = 0
        session['role'] = 'admin'
        session['nama'] = 'Administrator'
        return jsonify({"success": True, "role": "admin"})

    if not nis or not nama or not kelas:
        return jsonify({"error": "NIS, Nama, dan Kelas wajib diisi"}), 400

    db = get_db()
    cursor = db.cursor()

    # Check if student exists
    cursor.execute("SELECT id, nama, role FROM users WHERE nis = ?", (nis,))
    user = cursor.fetchone()

    if user:
        user_id = user['id']
        session['user_id'] = user_id
        session['role'] = user['role']
        session['nama'] = user['nama']
    else:
        # Register new student
        cursor.execute("INSERT INTO users (nis, nama, kelas, role) VALUES (?, ?, ?, 'student')", (nis, nama, kelas))
        db.commit()
        user_id = cursor.lastrowid
        session['user_id'] = user_id
        session['role'] = 'student'
        session['nama'] = nama

    return jsonify({"success": True, "role": "student", "nama": session['nama']})

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    if 'user_id' in session:
        return jsonify({"logged_in": True, "role": session.get('role'), "nama": session.get('nama')})
    return jsonify({"logged_in": False})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True})


# ==========================================
# TRACKING API
# ==========================================
@app.route('/api/progress', methods=['POST'])
def update_progress():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    page = data.get('page')
    slide = data.get('slide', 0)
    user_id = session['user_id']

    db = get_db()
    cursor = db.cursor()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute("SELECT user_id FROM progress WHERE user_id = ?", (user_id,))
    if cursor.fetchone():
        cursor.execute("UPDATE progress SET last_page = ?, last_materi_slide = ?, updated_at = ? WHERE user_id = ?", 
                       (page, slide, now, user_id))
    else:
        cursor.execute("INSERT INTO progress (user_id, last_page, last_materi_slide, updated_at) VALUES (?, ?, ?, ?)", 
                       (user_id, page, slide, now))
    db.commit()
    return jsonify({"success": True})

@app.route('/api/quiz', methods=['POST'])
def save_quiz():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    score = data.get('score', 0)
    total = data.get('total', 5)
    user_id = session['user_id']

    db = get_db()
    cursor = db.cursor()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute("INSERT INTO quiz_scores (user_id, score, total, date) VALUES (?, ?, ?, ?)", 
                   (user_id, score, total, now))
    db.commit()
    return jsonify({"success": True})


# ==========================================
# ADMIN DASHBOARD API
# ==========================================
@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    if session.get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db()
    cursor = db.cursor()
    
    query = """
        SELECT u.nis, u.nama, u.kelas, p.last_page, p.last_materi_slide, p.updated_at,
               (SELECT MAX(score) FROM quiz_scores WHERE user_id = u.id) as best_score
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        WHERE u.role = 'student'
        ORDER BY p.updated_at DESC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    
    stats = []
    for row in rows:
        stats.append({
            "nis": row['nis'],
            "nama": row['nama'],
            "kelas": row['kelas'],
            "last_page": row['last_page'] or 'Belum mulai',
            "last_slide": row['last_materi_slide'] or 0,
            "updated_at": row['updated_at'] or '-',
            "best_score": row['best_score'] if row['best_score'] is not None else '-'
        })
        
    return jsonify({"stats": stats})


# ==========================================
# GROQ AI CHAT API
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    
    # Prepend System Prompt
    system_prompt = {
        "role": "system",
        "content": (
            "Kamu adalah SAINTIKA, Tutor Virtual AI untuk materi Fisika (khususnya Fluida Dinamis). "
            "Kamu ramah, asyik, dan mudah dipahami oleh siswa SMA Kelas XI. Gunakan bahasa Indonesia. "
            "Bimbing siswa memahami konsep seperti Debit, Asas Kontinuitas, Hukum Bernoulli, Gaya Angkat Pesawat, dan Teorema Torricelli. "
            "Gunakan format teks yang rapi (bold, bullet points jika perlu). Format markdown (tebal, miring) diperbolehkan.\n\n"
            "Jika pengguna mengetik '/help', berikan daftar perintah berikut:\n"
            "- /konsep : Menjelaskan konsep dasar fluida dinamis\n"
            "- /rumus : Menampilkan rumus-rumus penting (Q = A.v, P + 1/2.rho.v^2 + rho.g.h = konstan)\n"
            "- /kuis : Memberikan satu pertanyaan kuis tebakan acak tentang fluida dinamis untuk dijawab siswa\n"
            "- /contoh : Memberikan contoh penerapan di kehidupan nyata\n\n"
            "Batasi jawaban agar tidak terlalu panjang (maksimal 2-3 paragraf), langsung ke intinya namun edukatif dan menyemangati siswa."
        )
    }
    
    # Make sure system prompt is always the first message
    api_messages = [system_prompt] + messages
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=api_messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        response_text = completion.choices[0].message.content
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Ubah host menjadi '0.0.0.0' agar bisa diakses dari perangkat lain di jaringan yang sama
    app.run(host='0.0.0.0', port=5000, debug=True)
