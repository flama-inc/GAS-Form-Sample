{
//// {string} 使用フォルダID
  folder_id: ""
//// {string} 書込み先スプレッドシートID
  ,sheet_id: ""
//// {string} フォームHTML内で表示されるtitleタグ内テキスト
  ,pagetitle: ""
//// {int} スプレッドシート書込み開始行
  ,startline: 1
//// {string} フォームHTMLファイル名（同一プロジェクト内）
  ,template_init: ""
//// {string} 完了時表示HTMLファイル名（同一プロジェクト内）
  ,template_complete: ""
//// {string} エラー時表示HTMLファイル名（同一プロジェクト内）
  ,template_error: ""
//// {string} HTML内formのうち、type="file"に指定したinput要素のname属性値
  ,form_file_name: ""
//// {array} Form内容チェック用配列
  ,inputs: [{
//// {string} スプレッドシートに記録すべきinput要素のname属性値
    name: ""
//// {string} ラベル
    ,label: ""
//// {boolean} 必須／非必須
    ,required: false
//// {boolean} このカラムが入力者のメールアドレスであるか否か
    ,ismail: false
  }]
// {boolean} メール送信するか否か
  ,with_mail: true
// {array} メール関連設定
  ,mail_configs: [{
//// {string} メールサブジェクト
    subject: ""
//// {string} メール本文テンプレートテキストファイルID
    ,mail_body_file_id: ""
//// {string} メールサブジェクトテンプレートテキストファイルID
    ,mail_title_file_id: ""
//// {string} メール送信先（空の場合は送信時に送信先を指定することが必須となる）
    ,send_to_address: ""
//// {object} メール送信オプション（GmailApp.sendEmailの仕様に基づく）
//// @see https://developers.google.com/apps-script/reference/gmail/gmail-app#sendEmail(String,String,String,Object)
    ,options:{
//// {string} 差出元アドレス
      from: ""
//// {string} 差出人名称
      ,name: ""
    }
//// {array} メール本文点プレート内置換リスト
//// サンクスメールと同時に運営者にもコピーを送信したい、などの場合は複数記述する
//// なお受付時刻とユニークID（Unixtime＋ランダム文字列）は指定しなくても置換対象となる
    ,replaces: [{
////// {string} テンプレート内の置換タグ
      from: ""
////// {string} 置換するinputのname
      ,to: ""
    }]
  }]
}
