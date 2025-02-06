from flask import Flask, jsonify, request
from flask_mysqldb import MySQL
import pandas as pd
import os
from werkzeug.utils import secure_filename
import traceback
from flask_cors import CORS
import numpy as np

app = Flask(__name__)

# MySQL Database Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''  
app.config['MYSQL_DB'] = 'air_quality'

mysql = MySQL(app)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Fuzzy Logic function to determine air quality based on PM2.5 value
def get_air_quality(pm25):
    if pm25 < 50:
        return "Baik"
    elif 50 <= pm25 < 100:
        return "Sedang"
    else:
        return "Buruk"

@app.route('/get_data', methods=['GET'])
def get_data():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM air_quality_data")
        data = cur.fetchall()

        results = []
        for row in data:
            results.append({
                'timestamp': row[0],
                'temperature': row[1],
                'humidity': row[2],
                'pm25': row[3],
                'air_quality': row[4]
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

        # Verify required columns
        required_columns = ['Timestamp', 'Suhu (°C)', 'Kelembapan (%)', 'PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'CO2 (ppm)', 'CO (ppm)', 'VOC (ppb)', 'baik']
        if not all(col in df.columns for col in required_columns):
            return jsonify({"error": "Missing required columns in the file"}), 400

        # Drop the 'baik' column entirely if you no longer need it
        df = df.drop(columns=['baik'])

        # Process the columns properly
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
        df['Suhu (°C)'] = pd.to_numeric(df['Suhu (°C)'], errors='coerce')
        df['Kelembapan (%)'] = pd.to_numeric(df['Kelembapan (%)'], errors='coerce')
        df['PM2.5 (µg/m³)'] = pd.to_numeric(df['PM2.5 (µg/m³)'], errors='coerce')
        df['PM10 (µg/m³)'] = pd.to_numeric(df['PM10 (µg/m³)'], errors='coerce')
        df['CO2 (ppm)'] = pd.to_numeric(df['CO2 (ppm)'], errors='coerce')
        df['CO (ppm)'] = pd.to_numeric(df['CO (ppm)'], errors='coerce')
        df['VOC (ppb)'] = pd.to_numeric(df['VOC (ppb)'], errors='coerce')

        # Apply fuzzy logic to determine air quality based on PM2.5 values
        df['air_quality'] = df['PM2.5 (µg/m³)'].apply(get_air_quality)

        # Replace NaN values with None (NULL in MySQL)
        df = df.where(pd.notnull(df), None)

        # Insert into MySQL
        cur = mysql.connection.cursor()
        mysql.connection.begin()

        for index, row in df.iterrows():
            try:
                cur.execute("""
                    INSERT INTO air_quality_data (timestamp, temperature, humidity, pm25, pm10, co2, co, voc, air_quality)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row['Timestamp'], row['Suhu (°C)'], row['Kelembapan (%)'], row['PM2.5 (µg/m³)'],
                    row['PM10 (µg/m³)'], row['CO2 (ppm)'], row['CO (ppm)'], row['VOC (ppb)'], row['air_quality']
                ))

            except Exception as e:
                print(f"Error inserting row {index}: {e}")
                continue  # Skip problematic rows

        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Data uploaded successfully"}), 200

    except Exception as e:
        error_details = traceback.format_exc()
        mysql.connection.rollback()
        return jsonify({"error": "Error uploading file", "details": error_details}), 500

@app.route('/fuzzy_air_quality', methods=['GET'])
def fuzzy_air_quality():
    try:
        pm25 = float(request.args.get('pm25'))
        
        def membership_baik(pm25):
            return max(0, min(1, (50 - pm25) / 50))
        
        def membership_sedang(pm25):
            return max(0, min((pm25 - 50) / 50, (100 - pm25) / 50))
        
        def membership_buruk(pm25):
            return max(0, min(1, (pm25 - 100) / 50))
        
        fuzzy_result = {
            "Baik": membership_baik(pm25),
            "Sedang": membership_sedang(pm25),
            "Buruk": membership_buruk(pm25)
        }
        return jsonify(fuzzy_result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
