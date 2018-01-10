const URL = require('url'),
    moment = require('moment-timezone'),
    monthList = require('./monthList'),
    download = require('image-downloader');

const parseLastPathInUrl = (urlToParse) => {
  let preparedURl = URL.parse(urlToParse);
  let urlArr = preparedURl.path.split('/');

  let clearName;
  if (urlArr[urlArr.length - 1].length === 0) {
    clearName = urlArr[urlArr.length - 2];
  } else {
    clearName = urlArr[urlArr.length - 1];
  }

  return clearName;
};

const parseDate = (date) => {
  // We have to add seconds to date for further parse.
  date += ':00';

  // Check if date have year, if not, it means this year and we need add it.
  if (date.search(/\d{4}/) === -1) {
    date = insertSubstring(date, `${moment().year()} `, date.lastIndexOf('в'))
  }

  return formatDate(date);
};


const parseImage = async (image) => {
  let imageUrl = URL.parse(image);
  let savePath = imageUrl.path.split('/')[imageUrl.path.split('/').length - 1];

  // Check if url contains image extension. If not, assume this is jpeg.
  if (savePath.search(/jpg$|jpeg$|png$/) === -1) {
    savePath += '.jpeg';
  }

  const options = {
    url: image,
    dest: `./front/static/articles/${savePath}`
  };

  let imageFile;

  try {
    const { filename, image } = await download.image(options);
    imageFile = filename;
  } catch (e) {
    console.error(e.message);
    imageFile = null;
  }

  return imageFile;
};

const insertSubstring = (main_string, ins_string, pos) => {
  if (typeof(pos) === "undefined") {
    pos = 0;
  }
  if (typeof(ins_string) === "undefined") {
    ins_string = '';
  }
  return main_string.slice(0, pos) + ins_string + main_string.slice(pos);

};

const formatDate = (date) => {
  let returnDate;

  if (date.search(/сегодня|вчера/) !== -1) {
    if (date.search(/сегодня/) !== -1) {
      returnDate = moment().format("YYYY-MM-DD");
    } else {
      returnDate = moment().add(-1, 'day').format("YYYY-MM-DD");
    }
  } else {
    let dateArr = date.trim().split(' ');
    let normalizedMonth = monthList[dateArr[1]];

    if (dateArr[0].toString().length === 1) {
      dateArr[0] = '0' + dateArr[0];
    }
    returnDate = `${dateArr[2]}-${normalizedMonth}-${dateArr[0]}`;
  }

// Return date and time from date string.
  return `${returnDate} ${date.slice(date.search(/\d{2}:/))}`;
};


module.exports = { parseDate, parseLastPathInUrl, parseImage };