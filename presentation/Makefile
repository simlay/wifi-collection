TITLE=wifipres

default: $(TITLE).tex
	latex $(TITLE)
	dvips $(TITLE).dvi
	ps2pdf $(TITLE).ps

clean: 
	rm -rf $(TITLE).aux $(TITLE).dvi $(TITLE).log $(TITLE).nav $(TITLE).out $(TITLE).ps $(TITLE).snm $(TITLE).toc

publish: default clean

veryclean: clean
	rm -rf $(TITLE).pdf
