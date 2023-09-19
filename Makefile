pgn-extract:
	rm -f external/pgn-extract
	curl -fsSL https://www.cs.kent.ac.uk/~djb/pgn-extract/pgn-extract-22-11.tgz --output external/pgn-extract.tgz
	tar -xzvf external/pgn-extract.tgz -C external
	mv external/pgn-extract external/pgn-extract-22-11
	rm -f external/pgn-extract.tgz
	cd external/pgn-extract-22-11 && make pgn-extract
	mv -f external/pgn-extract-22-11/pgn-extract external
	rm -rf external/pgn-extract-22-11
