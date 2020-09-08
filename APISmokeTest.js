var newman = require('newman'); 
var nodemailer  = require('nodemailer');
var fs = require('fs');
var http=require('http');

var export_file = './htmlResults_for_mail.html';
var export_file_junit = './junit.xml';
var collection_file = './API.postman_collection.json';
var env_file = './postman_environment.json';

var to_success = 'Xiliang Li (李锡亮)-软件集团 <lixiliang01@inspur.com>;zhangsiqiao@inspur.com';
var to_failure = 'Mark(马岩堂) <mayantang@inspur.com>; Leen Hu(胡立军) <hljun@inspur.com>; Jumoer Zhang (张鹏)-云服务集团 <zhangpeng08@inspur.com>; Kingping Liu (刘金平)-云服务集团 <liujinping01@inspur.com>; Flora Liu (刘雨蘅) <liuyuheng@inspur.com>; Daniel Li (李佳) <lijia_lc@inspur.com>; Mazone(马振) <mazhenrj@inspur.com>; Hugo Hu (胡建仁) <hujianren@inspur.com>; Chenxin Chen (陈新) <chenxinlc@inspur.com>; Sai Chen (陈赛) <chensai@inspur.com>; Joe Zhang (张四桥) <zhangsiqiao@inspur.com>; Mary Ma (马文丽) <mawenli@inspur.com>; Pengtao Qi (齐鹏涛) <qipengtao_lc@inspur.com>; Xiliang Li (李锡亮)-软件集团 <lixiliang01@inspur.com>; Love Mao (毛铁柱) <maotiezhu@inspur.com>;Xiliang Li (李锡亮)-软件集团 <dasym@qq.com>';
//var to_success = 'jiteng@inspur.com';
//var to_failure = 'jiteng@inspur.com';

var user = '844563792@qq.com';
var pass = '';

var from_success = '扫码接口监控--成功 <844563792@qq.com>';
var from_fail = '扫码接口监控--失败 <844563792@qq.com>';
var from_error = '扫码接口监控--异常 <844563792@qq.com>';

var args = process.argv.splice(2)

pass = args[0]
smspass = args[1]

smsurl="http://106.ihuyi.com/webservice/sms.php?method=Submit&account=C19358916&password="+smspass+"&mobile=15253197573&content=%E6%82%A8%E7%9A%84%E9%AA%8C%E8%AF%81%E7%A0%81%E6%98%AF%EF%BC%9A999999%E3%80%82%E8%AF%B7%E4%B8%8D%E8%A6%81%E6%8A%8A%E9%AA%8C%E8%AF%81%E7%A0%81%E6%B3%84%E9%9C%B2%E7%BB%99%E5%85%B6%E4%BB%96%E4%BA%BA%E3%80%82&format=json"
smslxlurl="http://106.ihuyi.com/webservice/sms.php?method=Submit&account=C19358916&password="+smspass+"&mobile=15754310718&content=%E6%82%A8%E7%9A%84%E9%AA%8C%E8%AF%81%E7%A0%81%E6%98%AF%EF%BC%9A999999%E3%80%82%E8%AF%B7%E4%B8%8D%E8%A6%81%E6%8A%8A%E9%AA%8C%E8%AF%81%E7%A0%81%E6%B3%84%E9%9C%B2%E7%BB%99%E5%85%B6%E4%BB%96%E4%BA%BA%E3%80%82&format=json"

newman.run({
    collection: require(collection_file),
    reporters: ['html','junit'],
    reporter : { html : { export : export_file,template: './template.hbs'}, junit : { export : export_file_junit}} ,
    environment: require(env_file)
}, function (err,summary) {
    if (err) { 
	http.get(smslxlurl);
        sendError();
        console.error('error:'+err);
        throw err;
    }
    else if(summary.error){
	http.get(smslxlurl);
        sendError();
        console.error('summary.error:'+summary.error);
        throw summary.error;
    }
    else{
        console.log('collection run complete!');

        var network_total = summary['run']['stats']['requests']['total'];
        var network_failed = summary['run']['stats']['requests']['failed'];
        var network_success = network_total - network_failed;
    
        var unit_total = summary['run']['stats']['assertions']['total'];
        var unit_failed = summary['run']['stats']['assertions']['failed'];
        var unit_success = unit_total - unit_failed;
        var stats = "接口调用"+network_total+"次，成功"+network_success+"次，失败"+network_failed+"次。\n共执行测试用例"+unit_total+"次，成功"+unit_success+"次，失败"+unit_failed+"次";
    
        var tracelog = JSON.stringify(summary, null, 2);

        var arr = summary['run']['failures'];
        var test_names_failures='';
        for ( var i = 0; i <arr.length; i++){
            if(arr[i].hasOwnProperty('error') && arr[i].error.hasOwnProperty('test') && arr[i].error.hasOwnProperty('message')){
                test_names_failures=test_names_failures+(i+1)+'、'+'用例名称：'+arr[i].error.test+'。 执行信息：'+arr[i].error.message+';'+' '+'\r\n';
	    }
        }
    
        if(network_failed==0 && unit_failed==0){
            sendSuccess(stats,tracelog,test_names_failures);
        }
        else{
	    http.get(smslxlurl);
            sendFailed(stats,tracelog,test_names_failures);
        }
    }
});

function sendSuccess(sub,tracelog,test_names_failures){
    var transporter = nodemailer.createTransport({
      service: 'qq', 
      port: 465,
      secureConnection: true, 
      auth: {
        user: user,
        pass: pass,
      }
	});
    
    var html = fs.readFileSync(export_file);
    
    var mailOptions = {
        from: from_success,
        to: to_success,
        subject: "扫码接口监控--运行测试报告--无失败信息："+sub,
        html:html
	};

    transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			throw error;
		} else {
			fn();
		}
	});
	
	console.log('emmail sent complete - success!');
}
function sendFailed(sub,tracelog,test_names_failures){
    var transporter = nodemailer.createTransport({
      service: 'qq', 
      port: 465, 
      secureConnection: true, 
      auth: {
        user: user,
        pass: pass,
      }
	});
    
    var html = fs.readFileSync(export_file);

	var mailOptions = {
		from: from_fail,
		to: to_failure,
		subject: "扫码接口监控--运行测试报告--有失败信息，请及时查看！！："+sub,
        html:html,
        attachments:[
                {   
                    filename: '失败信息.txt',
                    content: test_names_failures,
                    contentType: 'text/plain'
                }
        ],
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			throw error;
		} else {
			fn();
		}
	});
	
	console.log('emmail sent complete - failed!');
}
function sendError(){
    var transporter = nodemailer.createTransport({
      service: 'qq', 
      port: 465, 
      secureConnection: true, 
      auth: {
        user: user,
        pass: pass,
      }
	});
    
    var html = fs.readFileSync(export_file);

	var mailOptions = {
		from: from_error,
		to: to_failure,
		subject: "扫码接口监控--运行报告--服务器没有响应，请及时查看！！",
        text:"扫码接口监控--运行报告--服务器没有响应，请及时查看！！"
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			throw error;
		} else {
			fn();
		}
	});
	
	console.log('emmail sent complete - error!');
}
