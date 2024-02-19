function myFunction() {
  var rawday = Utilities.formatDate(new Date(),"JST","yyyyMMdd")
  var newday = rawday.slice(2,)
  var newday = String(newday)
  console.log(newday)

  let url= "https://murc-kawasesouba.jp/fx/past/index.php?id="+ newday
  let response = UrlFetchApp.fetch(url).getContentText('UTF-8');
  let html = Parser.data(response).from('<table class="data-table7">').to('</table>').build();
  //console.log(html)
 //'<td>US Dollar</td><td>�ăh��</td><td class="t_center">USD</td><td class="t_right">151.49 </td><td class="t_right">149.49 </td><td class="t_center"></td>'
  let newsList= new Array();
  newsList.push(["date","name","code","tts","ttb"])
  var topics = Parser.data(html).from('<tr>').to('</tr>').iterate()
  for(news of topics){
    //let newsRank = topics.indexOf(news) + 1;
    var news = news.replace(/[(\r)|(\t)|(\n)]*/g,"").replace("<td>","").replace(/(<td class="t_center">)/g,"").replace(/(<td class="t_right">)/g,"")
    var a = news.split("</td>");

    let newsInfo = [rawday, a[0],a[2],a[3],a[4]];
    newsList.push(newsInfo);
  }
  console.log(newsList);
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName("sheet1");
  sheet.clearContents();
  for(var i = 0; i < newsList.length; i++) {
   sheet.appendRow(newsList[i]);
 }

function convCsv(range) {
  try {
    var data = range.getValues();
    var ret = "";
    if (data.length > 1) {
      var csv = "";
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
          if (data[i][j].toString().indexOf(",") != -1) {
            data[i][j] = "\"" + data[i][j] + "\"";
          }
        }
        if (i < data.length-1) {
          csv += data[i].join(",") + "\r\n";
        } else {
          csv += data[i];
        }
      }
      ret = csv;
    }
    return ret;
  }
  catch(e) {
    Logger.log(e);
  }
};

  var projectId = 'concise-rope-356505';
  var datasetId = 'kaeru_sapiens';
  var tableId = 'mufg_'+ String(rawday);
  var table = {
    tableReference: {
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId
    }}
  try{
    BigQuery.Tables.remove(projectId, datasetId, tableId); 
  } catch(e) {}
  table = BigQuery.Tables.insert(table, projectId, datasetId);
  var range = sheet.getDataRange();
  var blob = Utilities.newBlob(convCsv(range)).setContentType('application/octet-stream');
  var job = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        //https://cloud.google.com/bigquery/docs/reference/rest/v2/tables#TableSchema
        autodetect:true,
        skipLeadingRows: 1
      }
    }
  };
  job = BigQuery.Jobs.insert(job, projectId, blob);
}
 
function convCsv(range) {
  try {
    var data = range.getValues();
    var ret = "";
    if (data.length > 1) {
      var csv = "";
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
          if (data[i][j].toString().indexOf(",") != -1) {
            data[i][j] = "\"" + data[i][j] + "\"";
          }
        }
        if (i < data.length-1) {
          csv += data[i].join(",") + "\r\n";
        } else {
          csv += data[i];
        }
      }
      ret = csv;
    }
    return ret;
  }
  catch(e) {
    Logger.log(e);
  }
}

