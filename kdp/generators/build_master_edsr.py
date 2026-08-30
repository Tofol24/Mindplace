#!/usr/bin/env python3
"""
APRENS · Cuentos — Constructor de MASTER-HR por EDSR x4 (tiled, Hann-blend).
SOURCE 1254² -> MASTER-HR 5016² (= 590 ppi @ 8,5"), conserva el trazo pictórico.
Requiere: opencv-contrib-python (cv2.dnn_superres) y el modelo EDSR_x4.pb.
  Modelo: https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb
Uso:  python3 build_master_edsr.py SRC.png OUT_masterHR.png [--model /tmp/EDSR_x4.pb]
"""
import sys, time, argparse, numpy as np, cv2

def upscale(src, out, model):
    sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(model); sr.setModel("edsr", 4)
    img = cv2.imread(src); H, W = img.shape[:2]; s = 4; tile = 200; ov = 24; step = tile - ov
    big = np.zeros((H*s, W*s, 3), np.float32); wsum = np.zeros((H*s, W*s, 1), np.float32)
    def win(hh, ww):
        wy = np.hanning(hh) if hh > 1 else np.ones(1); wx = np.hanning(ww) if ww > 1 else np.ones(1)
        return np.clip(np.outer(wy, wx).astype(np.float32), 0.02, 1.0)[..., None]
    t0 = time.time()
    for y in range(0, H, step):
        for x in range(0, W, step):
            y2 = min(y+tile, H); x2 = min(x+tile, W)
            up = sr.upsample(img[y:y2, x:x2]).astype(np.float32); hh, ww = up.shape[:2]; m = win(hh, ww)
            Y, X = y*s, x*s; big[Y:Y+hh, X:X+ww] += up*m; wsum[Y:Y+hh, X:X+ww] += m
    res = (big/np.maximum(wsum, 1e-6)).clip(0, 255).astype(np.uint8)
    cv2.imwrite(out, res, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    print(f"MASTER-HR {out}: {res.shape[1]}x{res.shape[0]} | {time.time()-t0:.0f}s")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--model", default="/tmp/EDSR_x4.pb"); a = ap.parse_args()
    upscale(a.src, a.out, a.model)
