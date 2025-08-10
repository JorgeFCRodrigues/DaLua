from flask import Flask, render_template

app = Flask(__name__)

<<<<<<< HEAD
@app.route('/')
def home():
    return render_template('tela_pedidos.html')

if __name__ == '__main__':
=======
@app.route("/")
def home():
    return render_template("tela_pedidos.html")

if __name__ == "__main__":
>>>>>>> 51bc1f4a9e02f0305ce0d17dfe96207c2a662598
    app.run(debug=True)