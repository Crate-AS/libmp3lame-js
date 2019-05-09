/**
 * EncoderWorker.js
 *
 * @author Logue <logue@hotmail.co.jp>
 * @version 1.1
 * @link http://jsdo.it/Masashi.Yoshikawa/wav2mp3byJS
 * @copyright (c)2013,2019 by Logue
 * @license MIT
 */
importScripts('libmp3lame.js');

// If you use bellow, please copy libmp3lame.min.wasm to this file same directory.
// When "Incorrect response MIME type" error occurred, your server does not set correct *.wasm  mime type.
// see https://github.com/mdn/webassembly-examples/issues/5
// importScripts('libmp3lame.min.js');

let mp3codec = null;
let mp3data = null;

self.onmessage = function (e) {
  switch (e.data.cmd) {
    case 'init':
      if (!e.data.config) {
        e.data.config = {};
      }
      mp3codec = Lame.init();

      Lame.set_mode(mp3codec, e.data.config.mode || Lame.JOINT_STEREO);
      Lame.set_num_channels(mp3codec, e.data.config.channels || 2);
      Lame.set_num_samples(mp3codec, e.data.config.samples || -1);
      Lame.set_in_samplerate(mp3codec, e.data.config.samplerate || 44100);
      Lame.set_out_samplerate(mp3codec, e.data.config.samplerate || 44100);
      Lame.set_VBR(mp3codec, e.data.config.vbr || Lame.VBR_OFF);
      
      Lame.set_bitrate(mp3codec, e.data.config.bitrate || 128); 
      Lame.set_VBR_q(mp3codec, e.data.config.vbr || 4);
      Lame.set_VBR_mean_bitrate_kbps(e.data.config.mean_bitrate_kbps || 128);
      Lame.set_VBR_min_bitrate_kbps(e.data.config.min_bitrate_kbps || 8);
      Lame.set_VBR_max_bitrate_kbps(e.data.config.maxn_bitrate_kbps || 320);

      Lame.init_params(mp3codec);

      self.postMessage({
        'res': 'ready',
        'version': Lame.get_version(),
        'mode': Lame.get_mode(mp3codec),
        'samples': Lame.get_num_samples(mp3codec),
        'channels': Lame.get_num_channels(mp3codec),
        'input_samplerate': Lame.get_in_samplerate(mp3codec),
        'output_samplerate': Lame.get_out_samplerate(mp3codec),
        'bitrate': Lame.get_bitrate(mp3codec),
        'vbr': Lame.get_VBR(mp3codec),
        'vbr_q': Lame.get_VBR_q(mp3codec),
        'vbr_mean_bitrate': Lame.get_VBR_mean_bitrate_kbps(mp3codec),
        'vbr_min_bitrate': Lame.get_VBR_min_bitrate_kbps(mp3codec),
        'vbr_max_bitrate': Lame.get_VBR_max_bitrate_kbps(mp3codec)
      });
      break;
    case 'encode':
      mp3data = Lame.encode_buffer_ieee_float(mp3codec, e.data.buf, e.data.buf);
      self.postMessage({ res: 'encoded', buf: mp3data.data });
      break;
    case 'finish':
      mp3data = Lame.encode_flush(mp3codec);
      self.postMessage({ res: 'end', buf: mp3data.data });
      Lame.close(mp3codec);
      mp3codec = null;
      break;
  }
};