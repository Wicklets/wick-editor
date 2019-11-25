class FontInfoInterface extends Object {
    constructor (editor) {
        super();
        this._allFontInfo = {};

        this._getAllFontInfo();

        this.editor = editor; 
        
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

    /**
     * Returns all font names with existing fonts at the front of the array.
     * @returns {string[]} fonts that currently exist in the project.
     */
    get allFontNames () {
      let existingFonts = this.editor.getExistingFonts();

      existingFonts = existingFonts.sort(function (a, b) {
          return a.localeCompare(b);
      });

      let loadableFonts = Object.keys(this.allFontInfo);

      // Remove existing fonts from the list.
      existingFonts.forEach((font) => {
        var index = loadableFonts.indexOf(font);
        if (index > -1) {
          loadableFonts.splice(index, 1);
        }
      });

      return existingFonts.concat(loadableFonts);
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

    /**
     * Returns true if the given font is already loaded by the project.
     */
    hasFont (font) {
      if (this.editor.hasFont) {
        return this.editor.hasFont(font);
      }
      return false; 
    }

    /**
     * Returns a list of all existing fonts.
     */
    getExistingFonts () {
      if (this.editor.getExistingFonts) {
        return this.editor.getExistingFonts();
      }
      return [];
    }

    /**
     * Returns true if the given font exists in the project.
     */
    isExistingFont (font) {
      return this.getExistingFonts().indexOf(font) > -1;
    }

    /**
     * Returns the font file as a blob.
     */
    getFontFile (args) {
      if (!args.font) {
        console.error("No font supplied to getFontFile"); 
        return;
      }

      let font = args.font;
      let variant = args.variant || 'regular';
      let weight = args.weight || '';

      let folderName = font + '/'
      let fontFileName = font + "_" + weight + variant + '.ttf';

      fetch (process.env.PUBLIC_URL + '/fonts/' + folderName + fontFileName)
      .then((response) => response.blob())
      .then((data) => {
          data.hasFont = false;
          if (args.callback) args.callback(data);
      })
      .catch((error) => {
        if (args.error) args.error(error);
      });
    }
}

export default FontInfoInterface
