String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` };

const	fs = require('fs'),
		path = require('path');

module.exports = function field_boss_time(mod) {
	
	const command = mod.command;
	
	const thirty_minutes = 30 * 60 * 1000;
	
	var bams = require('./saved.json'),
		changed = false;
				
	function getBamName(id)
	{
		switch (id)
		{
			case "@creature:26#5001": return "Ortan";
			case "@creature:51#4001": return "Kelros";
			case "@creature:39#501": return "Hazarr";
			default: return "John Cena";
		}
	}
	
	function addZero(i) 
	{
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}
	
	function saveJson(obj)
	{
		if (Object.keys(obj).length && changed)
		{
			try
			{
				fs.writeFileSync(path.join(__dirname,'./saved.json'), JSON.stringify(obj, null, "\t"));
				changed = false;
			}
			catch (err)
			{
				console.log(err);
				return false;
			}
		}
	}
			
	process.on('exit', ()=> {
		console.log('Speichert Worldboss Zeiten in die Save Datei...');
		saveJson(bams);
	});
	
	this.destructor = function() {
		console.log('Destructor: Speichert Worldboss Zeiten in die Save Datei...');
		saveJson(bams);
	}
	
	mod.hook('S_SYSTEM_MESSAGE', 1, event => {		
		const msg = mod.parseSystemMessage(event.message);
		if(msg.id === 'SMT_FIELDBOSS_APPEAR')
		{
			//console.log(msg);
			changed = true;
			let name = getBamName(msg.tokens.npcName);
			bams[name] = "Lebt noch.".clr("32CD32");
			command.message("Worldboss " + name.clr("56B4E9") + " ist gespawned.".clr("32CD32"));
		}
		else if(msg.id === 'SMT_FIELDBOSS_DIE_GUILD' || msg.id === 'SMT_FIELDBOSS_DIE_NOGUILD')	
		{
			//console.log(msg);
			changed = true;
			let name = getBamName(msg.tokens.npcname);
			command.message("Worldboss " + name.clr("56B4E9") + " wurde " + "gekillt".clr("DC143C") + " von " + msg.tokens.userName.clr("FDD017"));
			bams[name] = Date.now() + 5*60*60000 + (30 * 60 * 1000);
			command.message(name + ": " + makeText(bams[name]));
		}
	});
	
	function makeText(date)
	{
		if(isNaN(date))
		{
			return date;
		}
		if(date < Date.now())
		{
			return "?";
		}
		let startT = new Date(date - (60 * 60 * 1000));
		let endT = new Date(date);
		return "Respawn um " + (addZero(startT.getHours()) + ":" + addZero(startT.getMinutes())).clr("E69F00") + " - " + (addZero(endT.getHours()) + ":" + addZero(endT.getMinutes())).clr("E69F00");
	}

	command.add('Worldboss', () => {
		command.message("Ortan: ".clr("56B4E9") + makeText(bams.Ortan));
		command.message("Kelros: ".clr("56B4E9") + makeText(bams.Kelros));
		command.message("Hazarr: ".clr("56B4E9") + makeText(bams.Hazarr));
	})
}
