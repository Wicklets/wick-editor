class FontInfoInterface extends Object {
    constructor () {
        super();
        this._allFontInfo = {};

        this._getAllFontInfo();
    }

    _getAllFontInfo = () => {
        fetch (process.env.PUBLIC_URL + '/fonts/fontList.json')
        .then((response) => response.json())
        .then((data) => {
            this.allFontInfo = data;
        });
    }

    get allFontInfo () {
        return this._allFontInfo;
    }

    set allFontInfo (info) {
        this._allFontInfo = info;
    }

    get allFontNames () {
      return Object.keys(this.allFontInfo);
    }

    /**
     * Returns the font variant information for a specific font.
     * @param {string} font font name
     * @returns {Object|undefined} object containing variant information. Returns undefined if font is not in the font list.
     */
    fontInfo (font) {
      return this.allFontInfo[font];
    }

    /**
     * Returns all font variant types such as regular and italic. 
     * @param {string} font font name
     * @returns {string[]} Font variants
     */
    fontVariants (font) {
      return Object.keys(this.fontInfo(font));
    }

    /**
     * Returns the font weights available for a particular variant.
     * @param {string} font font name
     * @param {*} variant variant name
     * @returns {string[]|undefined} returns a list of weights. returns undefined if the font or variant does not exist.
     */
    fontWeightsByVariant (font, variant) {
      return this.fontInfo(font)[variant];
    }

    getFontFile (args) {
      if (!args.font) {
        console.error("No font supplied to getFontFile"); 
        return;
      }
      var font = args.font;
      if (!args.variant) var variant = 'regular'; 
      if (!args.weight) var weight = '';

      let fontFileName = font + "_" + weight + variant + '.ttf';

      fetch (process.env.PUBLIC_URL + '/fonts/' + fontFileName)
      .then((response) => response.arrayBuffer())
      .then((data) => {
          if (args.callback) args.callback(data);
      })
      .catch((error) => {
        if (args.error) args.error(error);
      });
    }
}

export default FontInfoInterface
