EMCC:=emcc
EMCC_OPTS:=\
    --memory-init-file 0 \
    -fno-exceptions \
    --pre-js pre.js \
    --post-js post.js \
    -s LINKABLE=1 \
    -s NO_FILESYSTEM=1 \
    -s ABORTING_MALLOC=0 \
    -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
    -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
    -s EXPORTED_FUNCTIONS="[ \
        '_get_lame_version', '_lame_init', '_lame_init_params', \
        '_lame_set_mode', '_lame_get_mode', '_lame_set_num_samples', '_lame_get_num_samples', \
        '_lame_set_num_channels', '_lame_get_num_channels', \
        '_lame_set_in_samplerate', '_lame_get_in_samplerate', \
        '_lame_set_out_samplerate', '_lame_get_out_samplerate', '_lame_set_brate', '_lame_get_brate', \
        '_lame_set_VBR', '_lame_get_VBR', '_lame_set_VBR_q', '_lame_get_VBR_q', \
        '_lame_set_VBR_mean_bitrate_kbps', '_lame_get_VBR_mean_bitrate_kbps', \
        '_lame_set_VBR_min_bitrate_kbps', '_lame_get_VBR_min_bitrate_kbps', \
        '_lame_set_VBR_max_bitrate_kbps', '_lame_get_VBR_max_bitrate_kbps', \
        '_lame_encode_buffer_ieee_float', '_lame_encode_flush', '_lame_close' \
       ]"

LAME_MAJOR_VERSION:=3.99
LAME_MINNOR_VERSION:=3.99.5
LAME:=lame-$(LAME_MINNOR_VERSION)

EMCONFIGURE:=emconfigure
EMMAKE:=emmake
LAME_URL:="https://downloads.sf.net/project/lame/lame/$(LAME_MAJOR_VERSION)/lame-$(LAME_MINNOR_VERSION).tar.gz"
TAR:=tar

all: dist/libmp3lame.js dist/libmp3lame.min.js

dist/libmp3lame.js: $(LAME) pre.js post.js
	$(EMCC) -O1 -s WASM=0 $(EMCC_OPTS) -s ASSERTIONS=1 $(wildcard $(LAME)/libmp3lame/*.o) -o $@

dist/libmp3lame.min.js: $(LAME) pre.js post.js
	$(EMCC) -Oz --llvm-lto 1 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 $(EMCC_OPTS) $(wildcard $(LAME)/libmp3lame/*.o) -o $@

$(LAME): $(LAME).tar.gz
	$(TAR) xzvf $@.tar.gz && \
	cd $@ && \
	$(EMCONFIGURE) ./configure --disable-frontend --build=none --host=none && \
	$(EMMAKE) make -j`nproc`

$(LAME).tar.gz:
	test -e "$@" || wget $(LAME_URL)

clean:
	$(RM) -rf $(LAME) ./dist/*.js ./dist/*.wasm ./dist/*.mem

distclean: clean
	$(RM) $(LAME).tar.gz

.PHONY: clean distclean
