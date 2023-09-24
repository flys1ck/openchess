pgn-extract:
	mkdir external
	rm -f external/pgn-extract
	curl -fsSL https://www.cs.kent.ac.uk/~djb/pgn-extract/pgn-extract-$(PGN_EXTRACT_VERSION).tgz --output external/pgn-extract.tgz
	tar -xzvf external/pgn-extract.tgz -C external
	mv external/pgn-extract external/pgn-extract-$(PGN_EXTRACT_VERSION)
	rm -f external/pgn-extract.tgz
	cd external/pgn-extract-$(PGN_EXTRACT_VERSION) && make pgn-extract
	mv -f external/pgn-extract-$(PGN_EXTRACT_VERSION)/pgn-extract external
	rm -rf external/pgn-extract-$(PGN_EXTRACT_VERSION)
