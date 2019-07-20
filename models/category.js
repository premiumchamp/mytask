class Category extends Parse.Object {
    
    constructor() {
        super('Category');
    }

    get name() {
        return this.get('name');
    }

    set name(val) {
        this.set('name', val);
    }

    get isFeatured() {
        return this.get('isFeatured');
    }

    set isFeatured(val) {
        this.set('isFeatured', val);
    }

    get status() {
        return this.get('status');
    }

    set status(val) {
        this.set('status', val);
    }

    get deletedAt() {
        return this.get('deletedAt');
    }

    set deletedAt(val) {
        this.set('deletedAt', val);
    }

    get image() {
        return this.get('image');
    }

    set image(val) {
        this.set('image', val);
    }

    get imageThumb() {
        return this.get('imageThumb');
    }

    set imageThumb(val) {
        this.set('imageThumb', val);
    }
}

Parse.Object.registerSubclass('Category', Category)

module.exports = Category