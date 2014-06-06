module.exports = {
  dateToMysqlFormat: function(subjectDate){
  
    var _addLeadingZero = function(d) {
      if(0 <= d && d < 10) return "0" + d.toString();
      if(-10 < d && d < 0) return "-0" + (-1*d).toString();
      return d.toString();
    };
    
    return subjectDate.getUTCFullYear() + "-" + 
      _addLeadingZero(1 + subjectDate.getMonth()) + "-" + 
      _addLeadingZero(subjectDate.getDate()) + " " + 
      _addLeadingZero(subjectDate.getHours()) + ":" + 
      _addLeadingZero(subjectDate.getMinutes()) + ":" + 
      _addLeadingZero(subjectDate.getSeconds());
    
  }
}