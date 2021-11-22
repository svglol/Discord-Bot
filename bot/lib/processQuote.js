module.exports = async function(message, client, quotes){
	let quote = message.content.match(/(?:"[^"]*"|^[^"]*$)/)[0];
	let userID = '';
	let date = message.createdTimestamp;

	//remove anything that isn't a quote
	if (!quote.includes('"')) {
		return;
	}

	//get userId of the quote
	let quoteEnd = message.content.split(/(?:"[^"]*"|^[^"]*$)/)[1];
	if (quoteEnd.includes('<@!')) {
		let i = quoteEnd.indexOf('<@!');
		quoteEnd = quoteEnd.substr(i);
		userID = quoteEnd.replace('<@!', '').replace('>', '');
	}else{
		return;
	}

	//check if already imported
	let imported = false;
	quotes.forEach(quote_ => {
		if(quote_.messageId === message.id ){
			imported = true;
		}
	});
            
	//import quote
	if(!imported)
		return await client.db.addQuote(userID, quote, date, message.id);

};