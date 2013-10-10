function notifyToDo(){
  //Spread Sheet Config
  var sheetName      = "Todo";
  var spreadSheetKey = "your spread sheet Key";
  //mail config
  var subject        = "[MyToDoリストからの通知]ステータスのお知らせ"; 
  var recipients     = new Array("mailaddress");
  //notification config
  var threshold      = 4; //何日前から通知するか
  
  
  var objSheetInfo = sheetInfo(sheetName,spreadSheetKey)
  var todoSheet    = objSheetInfo.getSheet();
  var index        = objSheetInfo.index();
 
  var body = '';
  //var status = '';
  var blnDol = false;
  var today = Utilities.formatDate(new Date(), objSheetInfo.getLocale(), "yyyy/MM/dd");

  for( var i=2 ; i <= todoSheet.getLastRow(); i++ ){
    //if delete Flag is set , skip the notification.
    if (todoSheet.getRange(i, index.deleted).getValue()){ continue; }
    var deadLineInSheet = todoSheet.getRange(i, index.deadline).getValue();
    var tmpDeadLine     = new Date(deadLineInSheet.getYear(),(deadLineInSheet.getMonth()),deadLineInSheet.getDate());
    var deadLine        = Utilities.formatDate(tmpDeadLine, "Asia/Tokyo", "yyyy/MM/dd");
    var diff = dateDiff(today,deadLine);
    if( diff == 0 ){
      var status = "タスクの期限日当日です。    -- ";
      blnDol = true;
    }else if( diff < threshold  && diff > 0 ){
      var status = "タスクの期限が近づいています。 (" + diff + "日以内)-- "; 
      blnDol = true;
    }else if( diff < 0 ) {
      var status = "タスクの期限が過ぎています。    -- ";
      blnDol = true;
    }else{
      continue; 
    }

    body =  body + 
            status  + 
            todoSheet.getRange(i, index.task).getValue() + 
            " - " + 
            deadLine
            + " \n\n"; 
  }

  //mail
  if (blnDol){ mailer().addRecipients(recipients).setSubject(subject).setBody(body).send(); }
  
}


//input arg format yyyy/mm/dd
function dateDiff(date1,date2){
  Logger.log('date1->' + date1);
  Logger.log('date2->' + date2);
  try{
    if ( date1.match(/\d{4}\/\d{2}\/\d{2}$/) && date2.match(/\d{4}\/\d{2}\/\d{2}$/) ){
      var oneday2Sec   = 24*60*60*1000;
      var tmpDate1 = new Date(date1.slice(0,4),(date1.slice(5,7)-1),date1.slice(8,10));
      var tmpDate2 = new Date(date2.slice(0,4),(date2.slice(5,7)-1),date2.slice(8,10));
      return ((tmpDate2.getTime() - tmpDate1.getTime())/oneday2Sec); //OK
    }
  }catch(e){
    Logger.log('dateDiff exception. ' + e.message);
  }
  return null;
}

var sheetInfo = function(sheetName,key){
  var methods = {};
  var m_sheetIndexAlias = { "task":1,"deadline":2,"notes":3 ,"deleted":4 }
  var m_sheetName = sheetName;
  var m_key       = key;
  var m_locale      = "Asia/Tokyo";
  var index = function(){ return m_sheetIndexAlias; }
  methods.index   = index;
  var setLocale = function(locale){ m_locale = locale };
  methods.setLocale = setLocale;
  var getLocale = function(){ return m_locale };
  methods.getLocale = getLocale;
  var getSheet    = function(){ 
    try{
      return SpreadsheetApp.openById(m_key).getSheetByName(m_sheetName);
    }catch(e){
      Logger.log('sheetInfo.getSheet exception->' + e.message); 
    }
  }
  methods.getSheet = getSheet;
  return methods;
}
var mailer = function(){
  var methods = {};
  var m_recipients = [];
  var m_subject = null;
  var m_body = null;
  
  methods.addRecipients = addRecipients;
  var addRecipients = function(addresses){
    for(var i=0; i < addresses.length ; i++){ m_recipients.push(addresses[i]);}
    return methods;
  }
  methods.addRecipients = addRecipients;
  
  var setSubject = function(subject){
    m_subject = subject;
    return methods;    
  }
  methods.setSubject = setSubject;
  var setBody = function(body){
    m_body = body;
    return methods;  
  }
  methods.setBody = setBody;
  var send = function(){
    try{
      var recipients = '';
      for(var i=0; i < m_recipients.length ; i++){ recipients = recipients + m_recipients[0] + ','}
      Logger.log('to:' + recipients.slice(0,-1));
      Logger.log('subject:' + m_subject);
      Logger.log('body:' + m_body);
      MailApp.sendEmail(recipients.slice(0,-1), m_subject, m_body);
      
    }catch(e){
      Logger.log("mailer can not send mail." +  e.message);
    }
  }
  methods.send = send;
  return methods;
}
