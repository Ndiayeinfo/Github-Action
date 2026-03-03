import psycopg2
try:
    psycopg2.connect('postgresql://admin:admin123@localhost:5434/gptdb')
    print('Connexion OK')
except UnicodeDecodeError as exc:
    print(exc.object.decode('latin-1'))
