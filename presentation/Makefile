TITLE=wifipres

default: $(TITLE).tex 
	pdflatex $(TITLE)

clean: 
	rm -rf $(TITLE).aux $(TITLE).dvi $(TITLE).log $(TITLE).nav $(TITLE).out $(TITLE).ps $(TITLE).snm $(TITLE).toc

publish: default clean

veryclean: clean
	rm -rf $(TITLE).pdf
