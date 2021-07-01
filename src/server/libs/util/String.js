export default {
    normalize(string)  {
        const temp = string.replace(/\s+/g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return (temp.slice(temp.length -1) === "_") ? temp.substring(0, temp.length-1) : temp;
    }
}