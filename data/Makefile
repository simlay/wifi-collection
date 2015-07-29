default:tables.csv

tables.csv:db_dump.json clean_data.py
	./clean_data.py
	./get_common_sample.sh 1

db_dump.json:
	./getdata.sh

clean:
	rm tables.cvs
	rm db_dump.json
