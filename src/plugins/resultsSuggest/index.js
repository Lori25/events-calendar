// 提示信息
let info = {
    defer: null,
    message: '操作成功',
    div: document.createElement('div'),
    time: 2000,
    content: '',
    icon: null,
    canClick: true
  }
  //弹出提示
  function show(args) {
    info.message = args.message || '操作成功';
    info.time = args.time || 2000;
    switch (args.icon) {
      case 'success':
        info.icon = 'icon-result-message icon-result-success';
        break;
      case 'timeout':
        info.icon = 'ion-ios-clock-outline';
        break;
      case 'wait':
        info.icon = 'icon-result-message icon-result-wait';
        info.content = '<div class="left-circle"></div><div class="right-circle"></div>';
        break;
      case 'error':
        info.icon = 'icon-result-message icon-result-error';
        break;
      default:
        info.icon = 'icon-result-message icon-result-success';
        break;
    }
    info.div.innerHTML = '<i class="icon '
      + info.icon + '">' + info.content + '</i><p>'
      + info.message + '</p>';
      info.div.classList.add('result-message');
    args.type && info.div.classList.add(args.type);
    document.body.appendChild(info.div);
    if(info.canClick == true){
      info.canClick = false;
      setTimeout(function () {
        document.body.removeChild(info.div);
        info.canClick = true;
      }, info.time);
    }
  }
  export default show