interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}
type CodeType = { code: number; id: number };
type ResultType = { rgb: RGB; hex: string };
type Results = {
  palette: Array<ResultType>;
  color: ResultType;
  first: ResultType;
  last: ResultType;
};

export default class GetColor {
  private image: HTMLImageElement;
  private canvas: HTMLCanvasElement | undefined;
  private ctx: any;
  private GoogleUserContent: string;
  private src: string | any;
  private result: any;
  width: number;
  height: number;
  url: string;

  /**
   *
   * @param url image URL
   */
  constructor(url: string, width: number = 15, height: number = 15) {
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

  public init(): Promise<Results | null> {
    return new Promise((resolve) => {
      let palettes: Array<ResultType>;
      this.image.src = this.src;
      this.image.setAttribute("crossorigin", "anonymous");
      this.image.style.cssText = `object-fit:scale-down`;

      this.image.addEventListener("load", () => {
        this.ctx.drawImage(
          this.image,
          0,
          0,
          this.image.width,
          this.image.height
        );
        // index = (100 * image.width + 100) * 4;
        this.result = this.ctx.getImageData(
          0,
          0,
          this.image.width,
          this.image.height
        ).data;

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

  private Palette(): Array<ResultType> {
    // create new array
    let element: HTMLImageElement = this.image,
      arr: Array<CodeType> = [],
      origin_all: any,
      arr_result: any,
      arr_final: any,
      colors: Array<ResultType>;

    origin_all = Array.from(this.result);
    arr = origin_all.map(
      (code: number, index: number): CodeType => ({
        code,
        id: Math.ceil((index + 1) / 4),
      })
    );
    arr_result = arr.filter(
      (e: CodeType, i: number) => e.id !== arr[i + 1]?.id
    );

    arr_final = Array.from(arr_result).map((e: any): Array<CodeType> => {
      const child: Array<CodeType> = arr.filter(
        (item: CodeType) => item.id === e.id
      );
      return child;
    });

    colors = arr_final.map((item: any) => {
      const item_rgb: RGB = {
        r: item[0]?.code,
        g: item[1]?.code,
        b: item[2]?.code,
        a: item[3]?.code,
      };
      const item_kex = this.GetHex(item_rgb);

      return {
        rgb: item_rgb,
        hex: item_kex,
      };
    });

    return colors;
  }

  private Color(): ResultType {
    let rgb: RGB, hex: string;
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
  private GetHex(rgb: RGB): string {
    const { r, g, b } = rgb;
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  private isBlob(url: any): boolean {
    const regex = /blob:\w+/gi;
    return regex.test(url);
  }

  private isDataImage(url: any): boolean {
    const regex = /data:image\/(png|jpg|jpeg|svg|webp);base64,\w+/gi;
    return regex.test(url);
  }
}
