const maleNames = ['Alek', 'Andrej', 'Anton', 'Balthazar', 'Bogan', 'Boris', 'Dargos', 'Darzin', 'Dragomir', 'Emeric', 'Falkon', 'Frederich', 'Franz', 'Gargosh', 'Gorek', 'Grygori', 'Hans', 'Harkus', 'Ivan', 'Jirko', 'Kobal', 'Korga', 'Krystofor', 'Lazlo', 'Livius', 'Marek', 'Miroslav', 'Nikolaj', 'Nimir', 'Oleg', 'Radovan', 'Radu', 'Seraz', 'Sergei', 'Stefan', 'Tural', 'Valentin', 'Vasily', 'Vladislav', 'Waltar', 'Yesper', 'Zsolt'];

const chooseRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const femaleNames = ['Alana', 'Clavdia', 'Danya', 'Dezdrelda', 'Diavola', 'Dorina', 'Drasha', 'Drilvia', 'Elisabeta', 'Fatima', 'Grilsha', 'Isabella', 'Ivana', 'Jarzinka', 'Kala', 'Katerina', 'Kereza', 'Korina', 'Lavinia', 'Magda', 'Marta', 'Mathilda', 'Minodora', 'Mirabel', 'Miruna', 'Nimira', 'Nyanka', 'Olivenka', 'Ruxandra', 'Sorina', 'Tereska', 'Valentina', 'Vasha', 'Victoria', 'Wensencia', 'Zondra'];

const familyNames = ['Alastroi', 'Antonovich/Antonova', 'Barthos', 'Belasco', 'Cantemir', 'Dargovich/Dargova', 'Diavolov', 'Diminski', 'Dilisnya', 'Drazkoi', 'Garvinski', 'Grejenko', 'Groza', 'Grygorovich/Grygorova', 'Ivanovich/Ivanova', 'Janek', 'Karushkin', 'Konstantinovich/Konstantinova', 'Krezkov/Krezkova', 'Krykski', 'Lansten', 'Lazarescu', 'Lukresh', 'Lipsiege', 'Martikov/ Martikova', 'Mironovich/Mironovna', 'Moldovar', 'Nikolovich/ Nikolova', 'Nimirovich/Nimirova', 'Oronovich/Oronova', 'Petrovich/Petrovna', 'Polensky', 'Radovich/Radova', 'Rilsky', 'Stefanovich/Stefanova', 'Strazni', 'Swilovich/Swilova', 'Taltos', 'Targolov/Targolova', 'Tyminski', 'Ulbrek', 'Ulrich', 'Vadu', 'Voltanescu', 'Zalenski', 'Zalken'];

module.exports = {
  desc: 'Get a random Barovian name (from Curse of Strahd).',
  options: {
    gender: {
      desc: 'The gender of the character.',
      noflag: true,
    },
  },
  run(message, args) {
    let nameArr;
    if (/^male^/i.test(args[0])) nameArr = maleNames;
    else if (/^female$/i.test(args[0])) nameArr = femaleNames;
    else nameArr = chooseRandom([maleNames, femaleNames]);

    message.channel.send(`${chooseRandom(nameArr)} ${chooseRandom(familyNames)}`);
  },
};
