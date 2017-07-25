var designPatterns = require('../index'), /* change to "var designPatterns = require('design-pattern');" for using outside the module */
    flyweightPattern =  designPatterns.flyweightPattern();


var article = 'The social roles theory suggests that social contexts have different gender role expectations and those gender role expectations can maximize or minimize gender differences. For instance, there are three competing hypotheses as to why and in what situations certain people hold doors for others. The gender neutral stance hypothesizes an equal amount of door holding would consistently be done by both sexes for both sexes. Chivalry is associated with male roles and is another hypothesis that predicts that men hold doors open for women as an act of helpfulness. Yet another stance looks at male dominance and how it is expressed in door holding behavior. This stance adds to the social role theory hypothesizing that door holding behaviors will be different depending on the emphasis on gender roles in the social context. The research done by Yoder, Hogue, Newman, Metz and LaVigne (2003) looks at door holding behavior in a dating situation as opposed to everyday life situations, predicting that males will hold open doors more often during a dating situation than in an everyday life situation. Seven hundred and sixty-nine mixed-gender, college-age, male-female pairs were unobtrusively observed in 16 different locations. The locations selected were places where either dating or non-dating couples were most likely to be found. These locations included shopping malls, universities and fast-good restaurants, for non-dating couples, and sit down restaurants and skate rinks, for dating couples. The amount of door holding for the other, either male of female, was measured. In an everyday context 55.2% more women, in the couples observed, held the door open for men than men did for women. In a dating context the reverse was found, 66.8% more men, in the couples observed, held the door open for women than women held the door open for men. This study contradicts studies done about 20 years ago, which suggests that door holding practices and gender roles have changed somewhat over the years in everyday life scenarios but remain similar in dating scenarios. Applying these results to the social role theory also suggests that door holding behavior may be different in dating versus everyday life scenarios because gender roles are more prominent in dating scenarios. Ref: http://courses.washington.edu/psy209/2003Door1.htm.  Researchers Yoder, Hogue, Newman, Metz, and LaVigne (2002) conducted a study to determine how gender salience affects door-holding behavior in the contexts of dating and everyday life. They hypothesized that, if door holding is a gender-neutral behavior, men and women would have the same rates of door holding in both contexts. If it is a helping behavior influenced by notions of chivalry, men would have higher rates in both contexts. Lastly, if it is a benevolent sexist behavior, men would have higher rates of door holding during dates than in everyday life. To obtain data for the study, five undergraduate students observed 769 college-age female-male pairs in 16 public places. Seven were everyday locations, pairs were only included in the study if a member of a non-courting pair was observed holding a door for the other member. In the dating locations, pairs were only included if a member of a courting pair exhibited door-holding behavior. The result of the study revealed that, in the context of everyday life, women held the door for men more than men did for women. However, in the dating context, men held the door for women more than women did for men. The data supported the benevolent sexism hypothesis but not the gender-neutral and helping behavior hypotheses. The outcome of this study implied that male door-holding behavior was more likely to occur in the context of dating because gender was more conspicuous. It supported the social role theory that the context variable is an important factor in influencing behavior. Ref: http://courses.washington.edu/psy209/2003Door2.htm ',
    words = article.split(' '),
    wordsLine = '';

console.log('\narticle = \n\n',article);
console.log('\nwords = \n');
for (var i = 0; i < words.length; i++) { wordsLine += '"' + words[i] + '" '; }
console.log(wordsLine);

for (var i = 0; i < words.length; i++) {
      flyweightPattern.add({value: words[i], domain: {
                                       wordInWordProcessor: {    
                                          properties: {
                                                type: 'word', bold: false, font: 'Times', fontSize: 16
                                          }}}});
};


function showStat(){
      var wordsCount = words.length,
          flyweightsCount = flyweightPattern.count();

      console.log('\n\nNumber of words = ', words.length);
      console.log('Number of flyweights = ', flyweightPattern.count());
}

showStat();

var atWord = flyweightPattern.get('at');
console.log('\natWord = \n', JSON.stringify(atWord, null, 0));


var hypothesisWord = flyweightPattern.get('hypothesis');
console.log('\nhypothesisWord = \n', JSON.stringify(hypothesisWord, null, 0));


hypothesisWord.domain.wordInWordProcessor.properties.bold = true;
hypothesisWord.domain.wordInWordProcessor.properties.font = 'monaco';
hypothesisWord.domain.wordInWordProcessor.properties.fontSize = '30';


// modify flyweight
flyweightPattern.add(hypothesisWord);

var modifiedHypothesisWord = flyweightPattern.get('hypothesis');

console.log('\nmodifiedHypothesisWord = \n', JSON.stringify(modifiedHypothesisWord, null, 0));

showStat();