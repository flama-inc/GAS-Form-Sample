# Form example

Google Apps Scriptでのフォーム機能サンプル

* アップローダー
* メール送信

---

## 注意事項

 * 書き込み先スプレッドシートに対して事前に権限設定が必要
 * メール送信機能を使用する場合は事前の権限設定が必要

---

## 設置

* gs・htmlファイルは同一プロジェクト内に配置する
* json・txtファイルはどちらもGoogleドキュメントとしてドライブ内に設置する。
	* json・txtファイルのままではロードされない
* 送信データ記録用のスプレッドシートを必要とする
* ログデータ保存用のスプレッドシートを必要とする

---

## 設定

* config.json内に設定を記述し、gsファイル冒頭にファイルIDを記述する。
* config.json内には、構成ファイル群のファイル・フォルダIDを記載する必要がある。
	* folder_id
		* 保存先フォルダ
	* sheet_id
		* 記録用スプレッドシート
	* log_sheet_id
		* ログ記録用スプレッドシート
	* mail_body_file_id
		* （mail_configs配列内各ノードに1件づつ）メール本文テキストファイル
* Google Script の公開機能を使用して、upload.gsのURLを得る

---

## 挙動

#### 起動

* doGet
	* config.jsonとform.htmlをロードし、画面を表示する。

#### フォーム受信

* processForm
	* Scriptの仕様上、フォームの入力内容は引数にオブジェクトとして渡される。

#### データ処理

* putLineToSpreadSheet
	* 送信データをスプレッドシートに記録

* saveUploadFile
	* アップロードファイルを保存
* sendMail
	* メール送信

#### その他機能を持つ関数

* getDirname
* makeSubfolder
* makeMailBody
* errorLog
* isObject

---









