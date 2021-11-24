var string = "1223;34534"
string.split(/;/g).forEach((item, i) => {
	if (item != '' ) console.log(item)
});
