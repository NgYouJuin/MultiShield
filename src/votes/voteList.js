import React, { Component } from "react";
import Chart from "chart.js/auto";
import { isAuthenticated } from "../auth/auth";
import { getVotesBySubmission } from "./apiVotes";

const CHART_COLOURS = [
    "#0d6efd",
    "#198754",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#20c997",
    "#fd7e14"
]

class VoteList extends Component {
    constructor() {
        super();
        this.state = {
            votes: []
        }
        this.chartRef = React.createRef()
        this.voteChart = null
    }

    componentDidMount(){
        const token = isAuthenticated().token
        const submissionId = this.props.submissionId;
        getVotesBySubmission(token, submissionId).then(data=> {
            if (data && data.success) {
                const votes = Array.isArray(data.data) ? data.data : (data.data && data.data.votes) || []
                this.setState({votes}, this.renderChart)
            }
        })
    }

    componentWillUnmount(){
        if (this.voteChart) {
            this.voteChart.destroy()
        }
    }

    getVoteChartData = () => {
        const {votes} = this.state
        const voteCounts = votes.reduce((counts, vote) => {
            const label = vote.vote === "No"
                ? "Not a scam"
                : vote.type_of_scam || "Scam - type not selected"

            return {
                ...counts,
                [label]: (counts[label] || 0) + 1
            }
        }, {})

        return Object.keys(voteCounts).map((label, index) => ({
            label,
            count: voteCounts[label],
            colour: CHART_COLOURS[index % CHART_COLOURS.length]
        }))
    }

    renderChart = () => {
        const chartData = this.getVoteChartData()
        const canvas = this.chartRef.current

        if (!canvas || chartData.length === 0) {
            return
        }

        if (this.voteChart) {
            this.voteChart.destroy()
        }

        this.voteChart = new Chart(canvas, {
            type: "pie",
            data: {
                labels: chartData.map(item => item.label),
                datasets: [{
                    data: chartData.map(item => item.count),
                    backgroundColor: chartData.map(item => item.colour),
                    borderColor: "#ffffff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const totalVotes = context.dataset.data.reduce((total, count) => total + count, 0)
                                const percentage = ((context.raw / totalVotes) * 100).toFixed(2)

                                return `${context.label}: ${context.raw} (${percentage}%)`
                            }
                        }
                    }
                }
            }
        })
    }

    render() {
        const chartData = this.getVoteChartData()
        const totalVotes = chartData.reduce((total, item) => total + item.count, 0)

        return(
            <div>
                <div className="card" style={{marginTop: "10px"}}>
                    <div className="card-body" style={{textAlign: "center"}}>
                        <h5 className="card-title">Vote breakdown</h5>
                        {totalVotes > 0 ? (
                            <div className="row align-items-center">
                                <div className="col-sm-12 col-md-5" style={{marginTop: "10px"}}>
                                    <div style={{height: "240px", maxWidth: "280px", margin: "0 auto"}}>
                                        <canvas ref={this.chartRef} aria-label="Vote breakdown pie chart"></canvas>
                                    </div>
                                </div>
                                <div className="col-sm-12 col-md-7" style={{marginTop: "10px", textAlign: "left"}}>
                                    {chartData.map(item => {
                                        const percentage = ((item.count / totalVotes) * 100).toFixed(2)

                                        return (
                                            <div
                                                key={item.label}
                                                className="d-flex align-items-center justify-content-between"
                                                style={{marginBottom: "8px"}}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <span
                                                        style={{
                                                            display: "inline-block",
                                                            width: "14px",
                                                            height: "14px",
                                                            backgroundColor: item.colour,
                                                            marginRight: "8px"
                                                        }}
                                                    ></span>
                                                    <span>{item.label}</span>
                                                </div>
                                                <span>
                                                    <strong>{item.count}</strong> ({percentage}%)
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="card-text">No votes yet!</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default VoteList
