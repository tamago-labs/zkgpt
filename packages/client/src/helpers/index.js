import * as bigintConversion from "bigint-conversion"

export const shortAddress = (address, first = 6, last = -4) => {
    return `${address.slice(0, first)}...${address.slice(last)}`
}

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

export const shorterText = (name, limit = 40) => {
    return name.length > limit ? `${name.slice(0, limit)}...` : name
}