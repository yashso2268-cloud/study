from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
import os
from dotenv import load_dotenv

# Load local environment variables from the .env file if it exists
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- Flask-Mail Configuration ---
# Securely pulls from system memory. No passwords are hardcoded here!
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')  
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')  
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])

mail = Mail(app)

# ... (The rest of your page routes and code remain exactly the same)

# --- Page Routes ---
@app.route('/')
def login_page():
    return render_template('index.html')

@app.route('/home.html')
def home_page():
    return render_template('home.html')

@app.route('/roadmap.html')
def roadmap_page():
    return render_template('roadmap.html')


# --- Password Reset Handling Route ---
@app.route('/reset-password', methods=['POST'])
def reset_password():
    if request.is_json:
        data = request.get_json()
        email = data.get('email')
    else:
        email = request.form.get('email')

    if not email:
        return jsonify({"status": "error", "message": "Email address is required."}), 400

    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("CRITICAL WARNING: Mail server configurations are missing in environment variables.")
        return jsonify({"status": "error", "message": "Mail system configuration error. Please contact admin."}), 500

    try:
        msg = Message(
            subject="SADU System — Password Reset Request",
            recipients=[email.strip()]
        )
        
        reset_link = f"{request.url_root.replace('http://', 'https://')}home.html?action=set-new-password"
        
        msg.body = f"""Hello,

You requested a password reset for your SADU portal account. Please click the link below to configure your security metrics:

{reset_link}

If you did not initiate this request, you can safely discard this communication.
"""
        mail.send(msg)
        return jsonify({"status": "success", "message": f"Password reset instructions dispatched to {email}."}), 200

    except Exception as e:
        print(f"SMTP Transmission Fault: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to transmit message payload. Verify email port rules."}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)