export default class GetColor {
    /**
     *
     * @param url image URL
     */
    constructor(url, width = 15, height = 15) {
        this.url = url;
        this.width = width;
        this.height = height;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.image = new Image(this.width, this.height);
        this.GoogleUserContent =
            "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=1&url=";
        if (url) {
            if (this.isBlob(url) || this.isDataImage(url)) {
                this.src = url;
                return;
            }
            this.src = this.GoogleUserContent + encodeURIComponent(url);
            return;
        }
    }
    init() {
        return new Promise((resolve) => {
            let palettes;
            this.image.src = this.src;
            this.image.setAttribute("crossorigin", "anonymous");
            this.image.style.cssText = `object-fit:scale-down`;
            this.image.addEventListener("load", () => {
                this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);
                // index = (100 * image.width + 100) * 4;
                this.result = this.ctx.getImageData(0, 0, this.image.width, this.image.height).data;
                palettes = this.Palette();
                resolve({
                    palette: palettes,
                    color: this.Color(),
                    first: palettes[0],
                    last: palettes[palettes.length - 1],
                });
            });
            this.image.addEventListener("error", () => {
                if (!!window.location.port) {
                    console.log(`Image with URL " ${this.url} " can't be loaded..`);
                }
                resolve(null);
            });
        });
    }
    Palette() {
        // create new array
        let element = this.image, arr = [], origin_all, arr_result, arr_final, colors;
        origin_all = Array.from(this.result);
        arr = origin_all.map((code, index) => ({
            code,
            id: Math.ceil((index + 1) / 4),
        }));
        arr_result = arr.filter((e, i) => { var _a; return e.id !== ((_a = arr[i + 1]) === null || _a === void 0 ? void 0 : _a.id); });
        arr_final = Array.from(arr_result).map((e) => {
            const child = arr.filter((item) => item.id === e.id);
            return child;
        });
        colors = arr_final.map((item) => {
            var _a, _b, _c, _d;
            const item_rgb = {
                r: (_a = item[0]) === null || _a === void 0 ? void 0 : _a.code,
                g: (_b = item[1]) === null || _b === void 0 ? void 0 : _b.code,
                b: (_c = item[2]) === null || _c === void 0 ? void 0 : _c.code,
                a: (_d = item[3]) === null || _d === void 0 ? void 0 : _d.code,
            };
            const item_kex = this.GetHex(item_rgb);
            return {
                rgb: item_rgb,
                hex: item_kex,
            };
        });
        return colors;
    }
    Color() {
        let rgb, hex;
        rgb = {
            r: this.result[0],
            g: this.result[1],
            b: this.result[2],
            a: this.result[3],
        };
        hex = this.GetHex(rgb);
        return {
            rgb,
            hex,
        };
    }
    /**
     *
     * @param rgb
     * @returns
     */
    GetHex(rgb) {
        const { r, g, b } = rgb;
        return ("#" +
            [r, g, b]
                .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
                .join(""));
    }
    isBlob(url) {
        const regex = /blob:\w+/gi;
        return regex.test(url);
    }
    isDataImage(url) {
        const regex = /data:image\/(png|jpg|jpeg|svg|webp);base64,\w+/gi;
        return regex.test(url);
    }
}
