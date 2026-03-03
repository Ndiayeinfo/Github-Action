import psycopg2
try:
    psycopg2.connect('postgresql://admin:test1234@127.0.0.1:5434/gptdb')
    print('Connexion OK')
except UnicodeDecodeError as exc:
    print(exc.object.decode('latin-1'))
