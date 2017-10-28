const equalityCheckOptions = {
    Fail: 0,
    Success: 1,
    idle: 2
};

const gameStatusOptions = {
    inProgress: 0,
    Lost: 1,
    Won: 2
}

const Header = (props) => (
    <div>
        <h3>Play Nine</h3>
        <hr/>
    </div>
);

class NumberBox extends React.Component {
    handleNumberClick = () => {
        this.props.handleNumberClick(this.props.number);
    }

    render() {
        const {
            number,
            selectedNumbers,
            usedNumbers,
            handleNumberClick
        } = this.props;

        const isSelected = selectedNumbers.includes(number);
        const isUsed = usedNumbers.includes(number);
        const numberBoxColor = isUsed ? 'lightgreen' :
            isSelected ? 'lightgrey'
                : 'grey';

        return (
            <div className={`numberBox ${numberBoxColor}`}
                 onClick={this.handleNumberClick}>
                {number}
            </div>
        )
    }
}
;

const NumberBoxList = (props) => {
    const {
        numbers,
        selectedNumbers,
        usedNumbers,
        handleNumberClick
    } = props;

    return (
        <div className="numberBoxList">
            {numbers && numbers.map(number =>
                <NumberBox
                    number={number}
                    handleNumberClick={handleNumberClick}
                    selectedNumbers={selectedNumbers}
                    usedNumbers={usedNumbers}
                />
            )}
        </div>
    )
};

const Star = (props) => (
    <span className="star">
    	<i className="fa fa-star"/>
    </span>
);

const StarReset = ({handleStarReset, starResetCount}) => (
    <button onClick={handleStarReset} className="btn reset">
        {starResetCount} <i className="fa fa-refresh"/>
    </button>
);

const SelectedNumbers = ({selectedNumbers, handleNumberClick}) => (
    <NumberBoxList
        numbers={selectedNumbers}
        selectedNumbers={selectedNumbers}
        usedNumbers={[]}
        handleNumberClick={handleNumberClick}
    />
);

const Dashboard = (props) => {
    const {
        starCount,
        selectedNumbers,
        handleNumberClick,
        handleStarReset,
        handleEqualityCheck,
        equalityCheckStatus,
        starResetCount
    } = props;

    const StarsNode = [...Array(starCount)].map((i) => <Star key={i}/>);

    return (
        <div className="dashboard">
            <div className="dashboard-item">
                {StarsNode}
            </div>
            <div className="dashboard-item">
                <EqualityChecker
                    handleEqualityCheck={handleEqualityCheck}
                    equalityCheckStatus={equalityCheckStatus}
                    selectedNumbers={selectedNumbers}
                />
                <StarReset
                    handleStarReset={handleStarReset}
                    starResetCount={starResetCount}
                />
            </div>
            <div className="dashboard-item">
                <SelectedNumbers
                    handleNumberClick={handleNumberClick}
                    selectedNumbers={selectedNumbers}
                />
            </div>
        </div>
    )
};

const EqualityChecker = (props) => {
    const {handleEqualityCheck, equalityCheckStatus, selectedNumbers} = props;
    const {idle, Success} = equalityCheckOptions;

    const statusClass = equalityCheckStatus === idle    ? "" :
                        equalityCheckStatus === Success ? "lightgreen"
                                                        : "red";

    return (
        <div>
            <button onClick={handleEqualityCheck}
                    disabled={selectedNumbers.length === 0}
                    className={`btn ${statusClass}`}
            >
                <i className="fa fa-check"/>
            </button>
        </div>
    )
};

const GameStatusBoard = ({status, handleGameReset}) => {
    const heading = (status === gameStatusOptions.Lost ? "Game Lost!" : "Game Won!");

    return (
        <div className="game-status">
            <h2>{heading}</h2>
            <div>
                <button onClick={handleGameReset} className="btn">
                    Try again
                </button>
            </div>
        </div>
    )
};

class App extends React.Component {
    state = {
        selectedNumbers: [],
        usedNumbers: [],
        starResetCount: 10,
        starCount: Math.ceil(Math.random(1, 9) * 9),
        equalityCheckStatus: equalityCheckOptions.idle
    }

    handleNumberSelect = (number) => {
        const {selectedNumbers, usedNumbers, equalityCheckStatus} = this.state;
        const isAlreadyActivated = usedNumbers.includes(number) ||
            selectedNumbers.includes(number)

        if (isAlreadyActivated) return;

        this.setState((prevState) => ({
            equalityCheckStatus: equalityCheckOptions.idle,
            selectedNumbers: [...prevState.selectedNumbers, number]
        }));
    }

    handleNumberUnselect = (number) => {
        this.setState({
            equalityCheckStatus: equalityCheckOptions.idle,
            selectedNumbers: this.state.selectedNumbers.filter((sn) => sn !== number)
        });
    }

    handleNumberClick = (number) => {
        this.state.selectedNumbers.includes(number) ?
            this.handleNumberUnselect(number) : this.handleNumberSelect(number);
    }

    handleStarReset = () => {
        if (this.state.starResetCount === 0) return;

        this.setState((prevState) => ({
            starResetCount: prevState.starResetCount - 1,
            starCount: this.generateRandomNumber(),
            selectedNumbers: []
        }))
    }

    handleGameReset = () => {
        this.setState({
            selectedNumbers: [],
            usedNumbers: [],
            starResetCount: 5,
            starCount: this.generateRandomNumber(),
            equalityCheckStatus: equalityCheckOptions.idle
        })
    }

    handleEqualityCheck = () => {
        const {selectedNumbers, starResetCount, starCount, usedNumbers} = this.state;
        const sumOfSelected = selectedNumbers.reduce((a, b) => a + b);

        if (sumOfSelected === starCount) {
            this.setState((prevState) => ({
                    usedNumbers: [...prevState.usedNumbers, ...selectedNumbers],
                    selectedNumbers: [],
                    starCount: this.generateRandomNumber(prevState.starCount),
                    equalityCheckStatus: equalityCheckOptions.Success
                })
            );
        } else {
            this.setState({equalityCheckStatus: equalityCheckOptions.Fail});
        }
    };

    calculateGameStatus = () => {
        const {starResetCount, usedNumbers, equalityCheckStatus, starCount} = this.state;

        const lastCheckFailed = starResetCount === 0 &&
            equalityCheckStatus === equalityCheckOptions.Fail;

        const lastStarCountNumberAlreadyUsed = starResetCount === 0 &&
            usedNumbers.includes(starCount);

        const allNumbersUsed = usedNumbers.length === 9;

        if (allNumbersUsed) return gameStatusOptions.Won;
        if (lastCheckFailed || lastStarCountNumberAlreadyUsed) return gameStatusOptions.Lost;

        return gameStatusOptions.InProgress;
    };

    generateRandomNumber = (oldNumber = 0) => {
        let rn;

        //making sure that new random number doesn't repeat the old one
        do rn = Math.ceil(Math.random(1, 9) * 9)
        while (rn === oldNumber);

        return rn;
    }

    render() {
        const {
            starCount,
            selectedNumbers,
            usedNumbers,
            equalityCheckStatus,
            starResetCount
        } = this.state;

        const numbers = (Array(10).fill().map((n, i) => i)).slice(1);
        const gameStatus = this.calculateGameStatus();

        return (
            <div style={{minWidth: "400px"}}>
                <Header />
                <Dashboard
                    starCount={starCount}
                    selectedNumbers={selectedNumbers}
                    handleNumberClick={this.handleNumberClick}
                    handleStarReset={this.handleStarReset}
                    handleEqualityCheck={this.handleEqualityCheck}
                    equalityCheckStatus={equalityCheckStatus}
                    starResetCount={starResetCount}
                />
                <NumberBoxList
                    handleNumberClick={this.handleNumberClick}
                    numbers={numbers}
                    selectedNumbers={selectedNumbers}
                    usedNumbers={usedNumbers}
                />

                {
                    gameStatus !== gameStatusOptions.InProgress &&
                    <GameStatusBoard
                        status={gameStatus}
                        handleGameReset={this.handleGameReset}
                    />
                }
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    mountNode
);
