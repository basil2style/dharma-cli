class Util {
  static stripZeroEx(data) {
    if (data.slice(0, 2) === '0x')
      return data.slice(2)
    else
      return data;
  }
}

module.exports = Util;
