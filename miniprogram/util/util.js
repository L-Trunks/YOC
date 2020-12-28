//时间戳转时间类型
export const formatDateTime = function(inputTime, type) {
    let date = new Date(inputTime);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute = date.getMinutes();
    let second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    let resultMap = {
        'yy-mm-dd-hh-mm-ss': y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second,
        'yy-mm': y + '-' + m,
        'yy-mm-dd': y + '-' + m + '-' + d,
        'mm.dd': `${m}.${d}`
    }
    return resultMap[type];
};
export const randomsort = function(a, b) {
    return Math.random() > .5 ? -1 : 1;
    //用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
}

//日期转时间戳
export const dateTimeStamp = function(data) {
    let date = new Date(data);
    let timestamp = date.getTime()
    return timestamp
}

//获取html字符串中图片src
//第一张图片src
export const getFirstPic = (str) => {
    let data = ''
    str.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/, function(match, capture) {
        data = capture
    })
    return data
}

//所有图片的src
export const getimgsrc = (htmlstr) => {
    let reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/gim
    let arr = []
    let tem = null
    while (tem = reg.exec(htmlstr)) {
        arr.push(tem[2])
    }
    return arr
}


//unicode转中文
export const exchangeUnicode = (str) => {
    str = JSON.stringify(str)
    str = str.replace(/(\\u)(\w{1,4})/gi, ($0) => {
        return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")),
            16)));
    });
    str = JSON.parse(str);
    return str;
}

// 获取指定日期n个月后日期
export const getNextMonthDay = (date, monthNum) => {
    let dateArr = date.split('-');
    let year = dateArr[0]; //获取当前日期的年份
    let month = dateArr[1]; //获取当前日期的月份
    let day = dateArr[2]; //获取当前日期的日
    let days = new Date(year, month, 0);
    days = days.getDate(); //获取当前日期中的月的天数
    let year2 = year;
    let month2 = parseInt(month) + parseInt(monthNum);
    if (month2 > 12) {
        year2 = parseInt(year2) + parseInt((parseInt(month2) % 12 == 0 ? (parseInt(month2) / 12) - 1 : parseInt(month2) / 12));
        month2 = parseInt(month2) % 12;
        if (month2 == 0) {
            month2 = 12;
        }
    }
    let day2 = day;
    let days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
        day2 = days2;
    }
    if (month2 < 10) {
        month2 = '0' + month2;
    }

    let t2 = year2 + '-' + month2 + '-' + day2;
    return t2;
}

//计算天数差
export const dateDiff = (sDate1, sDate2) => { //sDate1和sDate2是2002-12-18格式 
    let aDate, oDate1, oDate2, iDays
    aDate = sDate1.split("-")
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为12-18-2002格式 
    aDate = sDate2.split("-")
    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24) //把相差的毫秒数转换为天数 
    return iDays
}

//根据经纬度计算距离
export const distance = (la1, lo1, la2, lo2) => {
    let La1 = la1 * Math.PI / 180.0;
    let La2 = la2 * Math.PI / 180.0;
    let La3 = La1 - La2;
    let Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
}

//根据时间判断周几

export const weekDay = (date) => {
    let weekArray = ["日", "一", "二", "三", "四", "五", "六"];
    let week = weekArray[new Date(date).getDay()];
    return `周${week}`
}

//生成十六进制颜色值

export const getColor = () => {
    let num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    let str = "#";
    for (let i = 0; i < 6; i++) {
        str += num[Math.floor(Math.random() * 16)];
    }
    return str;
}

//数组去重
export const getSingleArr = (arr)=>{
    let tempObj = {}
    let result = []

    arr.map(i => {
        if (!tempObj[i]) {
            tempObj[i] = i
            result.push(i)
        }
    })

    console.log(result)
    return result
}