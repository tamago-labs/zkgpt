import * as bigintConversion from 'bigint-conversion'


export const isNumber = (string) => {
    console.log(string)
    const pattern = /^\d+\.?\d*$/;
    return pattern.test(string);  // returns a boolean
}

export const slugify = (text) => {
    return text
        .toString()
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export const encode = (val) => {
    switch (typeof val) {
        case "number":
            return BigInt(val);
        case "string":
            return bigintConversion.textToBigint(val);
        case "object":
            return bigintConversion.bufToBigint(val.buffer);
        default:
            return 0n;
    }
}