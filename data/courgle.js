TD_INDEX_COURSE_INDEX = 0
TD_INDEX_COURSE_NAME = 4
TD_INDEX_TEACHER_NAME = 9
DEBUG = true

function get_courses_information_table(body)
{
  //if the body does not has getElementsByTagName return false
  if (typeof body.getElementsByTagName !== 'function')
    return false

  tables = body.getElementsByTagName("table");
  for (var i = 0, len = tables.length; i < len; i++)
  {
    //alert(tables[i].getAttribute("bordercolordark") + "," + tables[i].getAttribute("cellpadding"))
    if (tables[i].getAttribute("bordercolordark") == "#CCCCCC" 
        && tables[i].getAttribute("cellpadding") == "1")
        return tables[i]
  }
  return false
}

self.port.on("courgle-query-text-result",function(result){
    $('#'+result.domid).html(result.data);
});

self.port.on("courgle-query-result",function(result){
    console.log("result");
    var data = result.data;
    var position = result.position;
  
    var $target = $("#"+position);

    console.log(data);
          
          var $new_row = $('<tr>').insertAfter($target);
          $new_row.attr("id","new_row-"+position);
          ids = data.split('\n');
          new_column = $('<td>').appendTo($new_row).attr('colspan', '16');
          list = $('<div>').addClass('courgle_article_link_wrapper').appendTo(new_column);
          for (i = 0; i < ids.length; i++)
          {
            if (ids[i].length == 0)
              continue;
            
            title_url = 'http://kiwilab.csie.org:9192/title?id=' + ids[i];
            content_url = 'http://kiwilab.csie.org:9192/?key=' + ids[i];
            domid = position+'-'+ids[i];
            item_wrapper = $('<div>')
              .addClass('courgle_article_link_item_wrapper')
              .attr('courgle-id', ids[i])
              .appendTo(list);
         

            title = $('<div>')
              .attr("id",'title-'+domid)
              .addClass('courgle_article_title')
              .appendTo(item_wrapper);
            
            content = $('<div>')
              .addClass('courgle_article_content')
              .hide()
              .attr("id",domid)
              .appendTo(item_wrapper);
            
            title.bind('click', domid,
                      function(event)
                      {
                        if (event.isPropagationStopped())
                          return ;
                        $("#"+event.data).toggle();
                        event.stopPropagation();
                      }
                      );
            self.port.emit("courgle-query-text",{"url":title_url,"domid":'title-'+domid});
            self.port.emit("courgle-query-text",{"url":content_url,"domid":domid});
                        
          }

});

function on_click_tr(event, tr)
{
    console.log("on_click_tr"+tr);
    console.log('~'+event);
    if(event===undefined){
        console.log('~ event undefined');
    }
  if (event.isPropagationStopped()){
    return ;
  }

    var $target = $("#"+event.data[0]);

  if ($target.attr('expanded') == "true")
  {
    $("#new_row-"+event.data[0]).remove(); 
    $target.attr('expanded', 'false');
    return ;
  }
  $target.attr('expanded', 'true');
  
  url = 'http://kiwilab.csie.org:9192/query?string=' + encodeURI(event.data[1] + '通識' + '評價');
    console.log('url='+url);

  self.port.emit("courgle-query",{
    "url":url,
    "position":event.data[0]});

  event.stopPropagation();
}

function insert_comment_list(main_fram_body)
{
  if (DEBUG)
    console.log('insert_comment_list called');
  

  courses_table = get_courses_information_table(main_frame_body);

  if (courses_table == false)
  {
    console.log('course table not found');
    return false;
  }

  courses_information = courses_table.getElementsByTagName('tr')
  // courses_information contains the header and normal column of course information
  
  
  
  console.log('begining enumerate courses' + '(' + (courses_information.length - 1) + ')')
  for (var i = 1, len = courses_information.length; i < len; i++)
  {
    course_information_tds = $('td', courses_information[i]);
    course_name_td = course_information_tds[TD_INDEX_COURSE_NAME];
    course_index_td = course_information_tds[TD_INDEX_COURSE_INDEX];
    teacher_name_td = course_information_tds[TD_INDEX_TEACHER_NAME];
    
    
    if (course_name_td.getElementsByTagName('a').length == 0)
      course_name = $(course_name_td).text().trim()
    else
      course_name = $('a', course_name_td).text()
      
    if (teacher_name_td.getElementsByTagName('a').length == 0)
      teacher_name = $(teacher_name_td).text().trim()
    else
      teacher_name = $('a', teacher_name_td).text()

    course_id = $(course_index_td).text();
    
    $(courses_information[i]).attr("id",course_id+'-'+i);
    $(courses_information[i]).bind('click', [course_id+'-'+i, course_name  + ' ' + teacher_name] , on_click_tr);
    
    if (DEBUG){
      console.log($(courses_information[i]).attr("id"));
      console.log($("#"+course_id+"-"+i).attr("id"));
    }
  }
}

function reset_flag()
{
  update_flag = false
}

function check()
{
  
  if (typeof update_flag == 'undefined' || !update_flag)
  {
    main_frame_body = document.body;
    if (typeof main_frame_body == 'undefined')
    {
      if (DEBUG)
        console.log('No body found');
      return ;
    }
    main_frame_body.onunload = reset_flag
    insert_comment_list(main_frame_body)
    update_flag = true;
  }
}

//alert(window.name);
if (window.name == "main")
  setInterval(check, 100);
 
