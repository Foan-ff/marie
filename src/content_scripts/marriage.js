const info = {
  male: {
    firstPageInfo: {
      city: { value: '440300000000', editor: '#area_citynan' },
      area: { value: '440307000000', editor: '#area_countynan' },
      street: { value: '440307013000', editor: '#area_townnan', },
      address: { value: '广东省深圳市龙岗区布龙路610号110室', editor: '#fjdnan' },
      liveCity: { value: '440300000000', editor: '#jzd_citynan', },
      liveArea: { value: '440307000000', editor: '#jzd_countynan' },
      liveStreet: { value: '440307013000', editor: '#jzd_townnan', },
    },

    secondPageInfo: {
      name: { value: '徐云帆', editor: '#xmnan', },
      id: { value: '412728199806220816', editor: '#sfzjhmnan', },
      degree: { value: '硕士研究生', editor: '#whcdnan', },
      job: { value: '专业技术人员', editor: '#zynan', },
      phone: { value: '15062218825', editor: '#lxdhnan', },
    },
  },

  female: {
    firstPageInfo: {
      city: { value: '440300000000', editor: '#area_citynv' },
      area: { value: '440305000000', editor: '#area_countynv' },
      street: { value: '440305010000', editor: '#area_townnv', },
      address: { value: '广东省深圳市南山区玉泉路146号毅哲大厦四楼', editor: '#fjdnv' },
      liveCity: { value: '440300000000', editor: '#jzd_citynv', },
      liveArea: { value: '440305000000', editor: '#jzd_countynv' },
      liveStreet: { value: '440305010000', editor: '#jzd_townnv', },
    },

    secondPageInfo: {
      name: { value: '席晨璐', editor: '#xmnv', },
      id: { value: '610302199804242026', editor: '#sfzjhmnv', },
      degree: { value: '硕士研究生', editor: '#whcdnv', },
      job: { value: '专业技术人员', editor: '#zynv', },
      phone: { value: '18392759144', editor: '#lxdhnv', },
    },
  },

  address: {
    date: '2024-08-02',
    city: '440300000000',
  },
};

// https://www.gdhy.gov.cn/yyjh.do?do=preYyxxOper&yyrq=2022-05-19&djjg=4403040A1000&yysj=16:30-17:00&ydbllx=01

const find = (selector) => {
  return document.querySelector(selector);
};
const sendMessage = chrome.runtime.sendMessage;
const onMessage = chrome.runtime.onMessage;

const Page = {
  autoClickEntryButton() {
    // page 1
    const button = find('a[href="/wsyy/yyjh.jsp"]');
    button.click();
  },

  autoFillBasicInfoForm() {
    // page 2
    const maleInfo = info.male.firstPageInfo;
    const femaleInfo = info.female.firstPageInfo;
    [maleInfo, femaleInfo].forEach((_info) => {
      // address 没有任何前置、后置依赖，直接填充
      const addressInfo = _info.address;
      const addressEditor = find(addressInfo.editor);
      addressEditor.value = addressInfo.value;

      const changeEvent = new Event('change');

      // 户籍所在市、区、街道
      const cityInfo = _info.city;
      const cityEditor = find(cityInfo.editor);
      cityEditor.value = cityInfo.value;
      cityEditor.dispatchEvent(changeEvent);
      setTimeout(() => {
        const areaInfo = _info.area;
        const areaEditor = find(areaInfo.editor);
        areaEditor.value = areaInfo.value;
        areaEditor.dispatchEvent(changeEvent);
        setTimeout(() => {
          const streetInfo = _info.street;
          const streetEditor = find(streetInfo.editor);
          streetEditor.value = streetInfo.value;
        }, 500);
      }, 500);
      
      // 常驻市、区、街道（非必填）
      // const liveCityInfo = _info.liveCity;
      // const liveCityEditor = find(liveCityInfo.editor);
      // liveCityEditor.value = liveCityInfo.value;
      // liveCityEditor.dispatchEvent(changeEvent);
      // setTimeout(() => {
      //   const liveAreaInfo = _info.liveArea;
      //   const liveAreaEditor = find(liveAreaInfo.editor);
      //   liveAreaEditor.value = liveAreaInfo.value;
      //   console.log(liveAreaEditor);
      //   liveAreaEditor.dispatchEvent(changeEvent);
      //   setTimeout(() => {
      //     const liveStreetInfo = _info.liveStreet;
      //     const liveStreetEditor = find(liveStreetInfo.editor);
      //     liveStreetEditor.value = liveStreetInfo.value;
      //   }, 500);
      // }, 500);

    });
    setTimeout(() => {
      const nextButton = find('input[class="btn_1"]');
      //nextButton.click();
    }, 1000);
  },

  autoFillTimeAndBase() {
    // page 3
    const dateEditor = find('#yyrq');
    dateEditor.value = info.address.date;
    const baseEditor = find('select[name="blcs"]');
    baseEditor.value = info.address.city;
    const queryButton = find('a[class="querybtn"]');
    queryButton.click();
  },

  autoFillCoupleInfoForm() {
    // page 4
    const maleInfo = info.male.secondPageInfo;
    const femaleInfo = info.female.secondPageInfo;
    [maleInfo, femaleInfo].forEach(_info => {
      const blurEvent = new Event('blur');
      const keys = Object.keys(_info);
      keys.forEach(key => {
        const { value, editor } = _info[key];
        const editorElement = find(editor);
        editorElement.value = value;
        if (key === 'id') {
          editorElement.dispatchEvent(blurEvent);
        }
      });
    });
  },
  
  bindEvent: function() {
    const that = this;

    window.addEventListener('load', () => {
      sendMessage({ action: 'PAGE_LOAD', });
    }, false);
    
    onMessage.addListener(function(req, sender, sendResponse) {
			console.log(req);
      const { action } = req;
      if (action === 'FILL_PAGE_1') {
        sendResponse('自动跳转去结婚登记流程');
        that.autoClickEntryButton();
      } else if (action === 'FILL_PAGE_2') {
        // 填充基本信息
        that.autoFillBasicInfoForm();
        sendResponse('ok');
      } else if (action === 'FILL_PAGE_3') {
        // 自动选择预约民政局和日期
        that.autoFillTimeAndBase();
        sendResponse('自动选择日期和结婚所在市');
      } else if (action === 'FILL_PAGE_4') {
        // 填充人员信息
        that.autoFillCoupleInfoForm();
        sendResponse('自动填写新人信息！！！！！');
      } else  {
        sendResponse('page received order from extension, but do not know what.')
      }
		});
  },

  init: function() {
    this.bindEvent();
  },
};

Page.init();
