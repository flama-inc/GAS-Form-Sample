/**
 * アップローダー・メール送信機能付きフォーム
 *
 * 書き込み先スプレッドシートに対して事前に権限設定が必要
 * メール送信機能を使用する場合は事前の権限設定が必要
 *
 */

// 設定JSONドキュメントID
var config_file_id = "1riLe5j7rOE_-yvOmiyDXvh2nr8H3liepkRSSSBlg1UQ";

var randlength = 16;
var now = getNow();
var dirname = getDirname();
var config;
var log;
var template_init;
var template_complete;
var template_error;

function init(){
// 設定読み込み・パース
  var text_config = DocumentApp.openById(config_file_id).getBody().getText();
  this.config = JSON.parse(text_config);
// ログスプレッドシートをオープン
  this.log = SpreadsheetApp.openById(this.config.log_sheet_id).getActiveSheet();
// テンプレートをロード
  this.template_init = HtmlService.createTemplateFromFile(this.config.template_init);
  this.template_complete = HtmlService.createTemplateFromFile(this.config.template_complete);
  this.template_error = HtmlService.createTemplateFromFile(this.config.template_error);

}

/**
 * 表示
 *
 * @param object event
 * @return object HtmlService
 */
function doGet(event){
  init();
//  return template.evaluate().setTitle(title).setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return this.template_init.evaluate().setTitle(this.config.pagetitle);

}

/**
 * 送信処理
 * 
 * From "form.html"
 *
 * @param object form
 * @return HtmlService
 * 
 */
function processForm(form) {
  init();
  if(!form){
    errorLog('FATAL','processForm','form object empty');
    error_message = '送信内容が空です。';
    return this.template_error.evaluate().getContent();
  }
  var errror_message = '';
  var address = '';
  var line = [now,dirname];
// 必須入力チェック・スプレッドシートへの書込配列生成・メールアドレス抽出
  for(i=0;i<this.config.inputs.length;i++){
    var name = this.config.inputs[i].name;
    if(form[name] !== 'undefined'){
      if(this.config.inputs[i].required && form[name] == ''){
        error_message = this.config.inputs[i].label + 'を入力してください。';
        return this.template_error.evaluate().getContent();
      }else{
        if(this.config.inputs[i].ismail && form[name]){
          address = form[name];
        }
        line.push(form[name]);
      }
    }
  }
  var lines = [line];
// スプレッドシート書き込み
  try{
    putLineToSpreadSheet(lines);
  }catch(e){
    errorLog('WARNING','putLineToSpreadSheet',e);
    error_message = e.message;
    return this.template_error.evaluate().getContent();
  }
// アップロードファイル保存
  try{
    saveUploadFile(dirname,form);
  }catch(e){
    errorLog('WARNING','saveUploadFile',e);
    error_message = e.message;
    return this.template_error.evaluate().getContent();
  }
// メール送信
  if(this.config.mail_configs){
    for(i=0;i<this.config.mail_configs.length;i++){
      var mail_options = {from:this.config.mail_configs[i].sender_address};
      if(this.config.mail_configs[i].sender_name){
        mail_options.name = this.config.mail_configs[i].sender_name;
      }
      try{
        var mailbody = DocumentApp.openById(config.mail_body_file_id).getBody().getText();
        mailbody = makeMailBody(mailbody,form,this.config.mail_configs[i].replace);
        if(config.send_to_address !== ""){
          address = this.config.mail_configs[i].sender_address;
        }
        var options = {from:this.config.mail_configs[i],name:this.config.mail_configs[i].name};
        sendMail(address,this.config.mail_configs[i].subject,mailbody,options);
      }catch(e){
        errorLog('FAIL','sendMail',e);
      }
    }
  }

  return this.template_complete.evaluate().getContent();
}

/**
 * スプレッドシートへの書き込み処理
 *
 * @param Array array_data
 * @return class Range
 * @see https://developers.google.com/apps-script/reference/spreadsheet/range
 */
function putLineToSpreadSheet(array_data){
  var sheet = SpreadsheetApp.openById(this.config.sheet_id).getActiveSheet();
  var maxlength = 0;
  for(i=0;i<array_data.length;i++){
    if(maxlength < array_data[i].length){
      maxlength = array_data[i].length;
    }
  }
  sheet.insertRowsBefore(this.config.startline, 1);
  return sheet.getRange(this.config.startline,1,array_data.length,maxlength).setValues(array_data);
}

/**
 * アップロードされたファイルを保存する
 *
 * @param {string} dirname サブディレクトリ名
 * @param {object} obj_form
 * @return {object} Class File or boolean
 * @see https://developers.google.com/apps-script/reference/drive/file
 */
function saveUploadFile(dirname,form){
  if(form[this.config.form_file_name] && form[this.config.form_file_name].getContentType() != 'application/octet-stream'){
    var subfolder = makeSubfolder(dirname);
    return subfolder.createFile(form[this.config.form_file_name]);
  }else{
    return false;
  }
}

/**
 * サブディレクトリ名を生成する
 *
 * @return {string} dirname
 */
function getDirname(){
  var rand = '';
  var dirname = new Date().getTime() + '_';
  for(i=0;i < randlength;i++){
    dirname += Math.floor(Math.random()*10).toString();
  }
  return dirname;
}

/**
 * 整形された日付を生成する
 *
 * @return {string} time stamp
 */
function getNow(){
  return Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyyy-MM-dd HH:mm:ss");
}

/**
 * サブディレクトリを作成する
 *
 * @return {object} Class File
 */
function makeSubfolder(dirname){
  return DriveApp.getFolderById(this.config.folder_id).createFolder(dirname);
}

/**
 * メール本文を生成する
 *
 * @param {object} form object
 * @param {string} mail body
 * @param {array} replace
 * @return {string} mailbody
 */
function makeMailBody(mailbody,form,replaces){
  mailbody = mailbody.replace('{dirname}', dirname).replace('{now}', now);
  for(i=0;i<replaces.length;i++){
    var key = replaces[i].to;
    mailbody = mailbody.replace(replaces[i].from,form[key]);
  }
  return mailbody;
}

/**
 * メールを送信する
 *
 * @param {string} mailbody
 * @form {object} from
 * @param {object} config
 * @param {strging} address
 * @return {void}
 * @see https://developers.google.com/apps-script/reference/gmail/gmail-app
 */
function sendMail(address,subject,mailbody,options){
  if(address == ""){
    errorLog('FAIL','sendMail',config);
  }
  if(!options || !isObject(options)){
    options = {};
  }
  try{
    return GmailApp.sendEmail(address, subject, mailbody, options);
  }catch(e){
    errorLog('FAIL','sendMail',e);
    return false;
  }
}

/**
 * ログを記録する
 *
 * @param {string} label
 * @param {string} method_name
 * @param {object} e
 * @return {void}
 */
function errorLog(label,method_name,e){
  if(!label){
    label = 'UNKNOWN'
  }
  if(!method_name){
    method_name = '(empty)'
  }
  if(!e){
    e = '(empty)';
  }
  var logdata = [now,label,method_name,JSON.stringify(e)];
  this.log.insertRowsBefore(1, 1);
  this.log.getRange(1,1,1,logdata.length).setValues([logdata]);
}

/**
 *
 *
 */
function isObject(variable) {
  if (Object.prototype.toString.call(variable) === '[object Array]') {
    return false;
  }
  return variable !== null && typeof variable === 'object';
}

/**
 * Test for putLineToSpreadSheet
 */
function test_putLineToSpreadSheet(){
  name = 'test_name';
  text = 'test_text';
  var lines = [[now,dirname,name,text]];
  Logger.log(putLineToSpreadSheet(lines));
}
/**
 * Test for makeSubfolder
 */
function test_makeSubfolder(){
  Logger.log(makeSubfolder(getDirname()));
}
/**
 * Test for getDirname
 */
function test_getDirname(){
  Logger.log(getDirname());
}
/**
 * Test for getNow
 */
function test_getNow(){
  Logger.log(getNow());
}
/**
 * test for saveUploadFile
 */
function test_saveUploadFile(){
  var subfolder = makeSubfolder('test');
  var obj_form = new Object;
  obj_form[form_file_name] = new Blob;
  Logger.log(saveUploadFile(subfolder,obj_form));
}
/**
 * test for makeMailBody
 */
function test_makeMailBody(){
  init();
  Logger.log(this.config.mail_configs[0]);
  var form = {myText:'test for makeMailBody'};
  var mailbody = DocumentApp.openById(this.config.mail_configs[0].mail_body_file_id).getBody().getText();
  Logger.log(makeMailBody(mailbody,form,this.config.mail_configs[0].replaces));
}
/**
 * test for sendMail
 */
function test_sendMail(){
  init();
  var address = 'rest.in.peace@i.softbank.jp';
  var form = {myText:'test for sendMail'};
  var mailbody = DocumentApp.openById(this.config.mail_configs[0].mail_body_file_id).getBody().getText();
  mailbody = makeMailBody(mailbody,form,this.config.mail_configs[0].replaces)
  var mail_options = {from:this.config.mail_configs[0].options.from,name:this.config.mail_configs[0].options.name};
  Logger.log(sendMail(address,this.config.mail_configs[0].subject,mailbody,mail_options));
}
/**
 * test for errorLog
 */
function test_errorLog(){
  init();
  errorLog('FATAL','test_errorLog',{"column":"check"});
}
/**
 * test for isObject
 */
function test_isObject(){
  var check1 = {};
  Logger.log(isObject(check1));
  var check2 = 'string';
  Logger.log(isObject(check2));
  var check3 = 1;
  Logger.log(isObject(check3));
  var check4 = null;
  Logger.log(isObject(check4));
}