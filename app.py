from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store VAT numbers in memory (in a real application, you'd use a database)
vat_data = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Please upload a CSV file'}), 400
    
    try:
        df = pd.read_csv(file)
        if 'VAT NUM' not in df.columns:
            return jsonify({'error': 'CSV must contain a "VAT NUM" column'}), 400
        
        global vat_data
        vat_data = df['VAT NUM'].tolist()
        return jsonify({'message': 'File uploaded successfully', 'data': vat_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/get_vat_data')
def get_vat_data():
    return jsonify({'data': vat_data})

@app.route('/validate_vat', methods=['POST'])
def validate_vat():
    vat_number = request.json.get('vat_number')
    if not vat_number:
        return jsonify({'error': 'No VAT number provided'}), 400
    
    try:
        # VIES API endpoint
        url = f"http://ec.europa.eu/taxation_customs/vies/rest/check-vat-number"
        payload = {
            "countryCode": vat_number[:2],
            "vatNumber": vat_number[2:]
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data.get('valid'):
            return jsonify({
                'valid': True,
                'name': data.get('name', ''),
                'address': data.get('address', '')
            })
        else:
            return jsonify({
                'valid': False,
                'error': 'VAT Invalid'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_vat', methods=['POST'])
def update_vat():
    data = request.json
    old_vat = data.get('old_vat')
    new_vat = data.get('new_vat')
    
    if not old_vat or not new_vat:
        return jsonify({'error': 'Missing VAT numbers'}), 400
    
    try:
        global vat_data
        index = vat_data.index(old_vat)
        vat_data[index] = new_vat
        return jsonify({'message': 'VAT number updated successfully'})
    except ValueError:
        return jsonify({'error': 'VAT number not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 