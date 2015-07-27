default:tables.csv

tables.csv:db_dump.json
	./clean_data.py

db_dump.json:
	./getdata.sh
