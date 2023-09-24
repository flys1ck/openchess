pgn-extract:
	mkdir -p external
	rm -f external/pgn-extract
	curl -fsSL https://www.cs.kent.ac.uk/~djb/pgn-extract/pgn-extract-$(PGN_EXTRACT_VERSION).tgz --output external/pgn-extract.tgz
	tar -xzf external/pgn-extract.tgz -C external
	mv external/pgn-extract external/pgn-extract-$(PGN_EXTRACT_VERSION)
	rm -f external/pgn-extract.tgz
	cd external/pgn-extract-$(PGN_EXTRACT_VERSION) && make pgn-extract
	mv -f external/pgn-extract-$(PGN_EXTRACT_VERSION)/pgn-extract external
	rm -rf external/pgn-extract-$(PGN_EXTRACT_VERSION)

stockfish:
	mkdir -p external
	rm -f external/stockfish
	curl -fsSL https://github.com/official-stockfish/Stockfish/releases/download/sf_${STOCKFISH_VERSION}/stockfish-$(STOCKFISH_PLATFORM)-x86-64-modern.tar --output external/stockfish.tar
	tar -xf external/stockfish.tar -C external
	mv -f external/stockfish/stockfish-$(STOCKFISH_PLATFORM)-x86-64-modern external
	rm -rf external/stockfish
	mv -f external/stockfish-$(STOCKFISH_PLATFORM)-x86-64-modern external/stockfish
	rm -f external/stockfish.tar
