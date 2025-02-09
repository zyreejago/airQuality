from flask import Flask, jsonify, request
from flask_mysqldb import MySQL
import pandas as pd
import os
from werkzeug.utils import secure_filename
import traceback
from flask_cors import CORS
import numpy as np
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

app = Flask(__name__)

# MySQL Database Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''  
app.config['MYSQL_DB'] = 'air_quality'

mysql = MySQL(app)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

app.config['SECRET_KEY'] = os.urandom(24)
@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    # Cek apakah username sudah ada
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"message": "Username already exists"}), 400

    # Enkripsi password dan simpan ke DB
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
    mysql.connection.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    if user and bcrypt.check_password_hash(user[2], password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Fuzzy Logic Functions for Multiple Parameters (threshold included)
def fuzzy_pm25(pm25):
    if pm25 < 50:
        return "Baik"
    elif 50 <= pm25 < 100:
        return "Sedang"
    elif 100 <= pm25 < 300:
        return "Buruk"
    elif 300 <= pm25 < 500:
        return "Sangat Buruk"
    else:
        return "Berbahaya"

def fuzzy_pm10(pm10):
    if pm10 < 50:
        return "Baik"
    elif 50 <= pm10 < 100:
        return "Sedang"
    elif 100 <= pm10 < 300:
        return "Buruk"
    elif 300 <= pm10 < 500:
        return "Sangat Buruk"
    else:
        return "Berbahaya"

def fuzzy_co2(co2):
    if co2 < 600:
        return "Baik"
    elif 600 <= co2 < 1000:
        return "Sedang"
    elif 1000 <= co2 < 2000:
        return "Buruk"
    else:
        return "Sangat Buruk"

def fuzzy_co(co):
    if co < 4:
        return "Baik"
    elif 4 <= co < 9:
        return "Sedang"
    elif 9 <= co < 15:
        return "Buruk"
    else:
        return "Sangat Buruk"

def fuzzy_voc(voc):
    if voc < 250:
        return "Baik"
    elif 250 <= voc < 500:
        return "Sedang"
    elif 500 <= voc < 1000:
        return "Buruk"
    else:
        return "Sangat Buruk"

def determine_air_quality(pm25, pm10, co2, co, voc):
    results = [fuzzy_pm25(pm25), fuzzy_pm10(pm10), fuzzy_co2(co2), fuzzy_co(co), fuzzy_voc(voc)]
    
    if "Berbahaya" in results:
        return "Berbahaya"
    elif "Sangat Buruk" in results:
        return "Sangat Buruk"
    elif "Buruk" in results:
        return "Buruk"
    elif "Sedang" in results:
        return "Sedang"
    else:
        return "Baik"

# Fungsi untuk mendapatkan threshold untuk setiap parameter
def get_threshold(pm25, pm10, co2, co, voc):
    return {
        'pm25': fuzzy_pm25(pm25),
        'pm10': fuzzy_pm10(pm10),
        'co2': fuzzy_co2(co2),
        'co': fuzzy_co(co),
        'voc': fuzzy_voc(voc)
    }

@app.route('/get_data', methods=['GET'])
def get_data():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM air_quality_data")
        data = cur.fetchall()

        results = []
        for row in data:
            air_quality = determine_air_quality(row[3], row[5], row[6], row[7], row[8])
            thresholds = get_threshold(row[4], row[5], row[6], row[7], row[8])  # Mengambil threshold untuk tiap parameter
            results.append({
                'id': row[0],
                'timestamp': row[1],
                'temperature': row[2],
                'humidity': row[3],
                'pm25': row[4],
                'pm10': row[5],
                'co2': row[6],
                'co': row[7],
                'voc': row[8],
                'air_quality': air_quality,
                'thresholds': thresholds  # Menambahkan threshold untuk masing-masing parameter
            })

        cur.close()
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload_data', methods=['POST'])
def upload_data():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        df = pd.read_excel(filepath)

        # Clean column names
        df.columns = df.columns.str.replace('Â°C', '°C') \
                               .str.replace('Âµg/mÂ³', 'µg/m³') \
                               .str.strip()

        required_columns = ['Timestamp', 'Suhu (°C)', 'Kelembapan (%)', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'CO2 (ppm)', 'CO (ppm)', 'VOC (ppb)']
        if not all(col in df.columns for col in required_columns):
            return jsonify({"error": "Missing required columns in the file"}), 400

        # Process the columns
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        df['Suhu (°C)'] = pd.to_numeric(df['Suhu (°C)'], errors='coerce')
        df['Kelembapan (%)'] = pd.to_numeric(df['Kelembapan (%)'], errors='coerce')
        df['PM2.5 (µg/m³)'] = pd.to_numeric(df['PM2.5 (µg/m³)'], errors='coerce')
        df['PM10 (µg/m³)'] = pd.to_numeric(df['PM10 (µg/m³)'], errors='coerce')
        df['CO2 (ppm)'] = pd.to_numeric(df['CO2 (ppm)'], errors='coerce')
        df['CO (ppm)'] = pd.to_numeric(df['CO (ppm)'], errors='coerce')
        df['VOC (ppb)'] = pd.to_numeric(df['VOC (ppb)'], errors='coerce')

        # Apply air quality determination with thresholds
        df['air_quality'] = df.apply(lambda row: determine_air_quality(row['PM2.5 (µg/m³)'], row['PM10 (µg/m³)'], row['CO2 (ppm)'], row['CO (ppm)'], row['VOC (ppb)']), axis=1)
        df['thresholds'] = df.apply(lambda row: get_threshold(row['PM2.5 (µg/m³)'], row['PM10 (µg/m³)'], row['CO2 (ppm)'], row['CO (ppm)'], row['VOC (ppb)']), axis=1)

        df = df.where(pd.notnull(df), None)

        cur = mysql.connection.cursor()
        mysql.connection.begin()

        for index, row in df.iterrows():
            try:
                cur.execute("""
                    INSERT INTO air_quality_data (timestamp, temperature, humidity, pm25, pm10, co2, co, voc, air_quality, thresholds)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row['Timestamp'], row['Suhu (°C)'], row['Kelembapan (%)'], row['PM2.5 (µg/m³)'],
                    row['PM10 (µg/m³)'], row['CO2 (ppm)'], row['CO (ppm)'], row['VOC (ppb)'], row['air_quality'], str(row['thresholds'])
                ))
            except Exception as e:
                print(f"Error inserting row {index}: {e}")
                continue

        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Data uploaded successfully"}), 200

    except Exception as e:
        error_details = traceback.format_exc()
        mysql.connection.rollback()
        return jsonify({"error": "Error uploading file", "details": error_details}), 500


if __name__ == '__main__':
    app.run(debug=True)
