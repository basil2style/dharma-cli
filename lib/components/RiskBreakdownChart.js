import contrib from 'blessed-contrib';
import BigNumber from 'bignumber.js';

const barStyle = {
  top: '60%',
  left: '30%',
  width: '40%',
  height: '40%',
  label: 'Default Risk Breakdown (\u039E)',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  barFgColor: 'white',
  barBgColor: 'green',
  barWidth: 8,
  barSpacing: 15,
  xOffset: 0,
  maxHeight: 9
}

class RiskBreakdownChart {
  constructor() {
    this.barChart = contrib.bar(barStyle)
  }

  getNode() {
    return this.barChart
  }

  render(investments) {
    const riskTranches = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
    let riskProfile = [];

    for (let i = 0; i < 5; i++) {
      let valueInvested = new BigNumber(0);
      const decimals = new BigNumber(10**18);
      const trancheWidth = new BigNumber(0.2);
      const defaultRiskMin = trancheWidth
                                .times(i)
                                .plus(0.01)
                                .times(decimals)
      const defaultRiskMax = trancheWidth
                                .times(i + 1)
                                .times(decimals)

      investments.forEach((investment) => {
        const loan = investment.loan;
        const balance = new BigNumber(investment.balance);
        if (loan.defaultRisk.gte(defaultRiskMin) &&
          loan.defaultRisk.lte(defaultRiskMax)) {
          valueInvested = valueInvested.plus(balance.div(decimals))
        }
      })

      riskProfile.push(valueInvested);
    }

    this.barChart.maxHeight = Math.max(riskProfile);

    this.barChart.setData({
      titles: riskTranches,
      data: riskProfile
    })
  }
}

module.exports = RiskBreakdownChart;
