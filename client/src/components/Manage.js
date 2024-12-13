import React from 'react';

class Manage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 'NewEvent',
        };
    }

    navigateTo = (page) => {
        this.setState({ currentPage: page });
    };

    render() {
        const routerStyle = {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '20px',
        };

        const linkStyle = {
            textDecoration: 'none',
            color: 'black',
            cursor: 'pointer',
        };

        const { currentPage } = this.state;

        return (
            <div>
                {/* 导航栏 */}
                <ul style={routerStyle}>
                    <li style={linkStyle} onClick={() => this.navigateTo('NewEvent')}>New Event</li>
                    <li style={linkStyle} onClick={() => this.navigateTo('ModifyEvent')}>Modify Event</li>
                    <li style={linkStyle} onClick={() => this.navigateTo('CreateUser')}>Create User</li>
                    <li style={linkStyle} onClick={() => this.navigateTo('ModifyUser')}>Modify User</li>
                </ul>

                <div>
                    {currentPage === 'NewEvent' && <NewEvent />}
                    {currentPage === 'ModifyEvent' && <ModifyEvent />}
                    {currentPage === 'CreateUser' && <CreateUser />}
                    {currentPage === 'ModifyUser' && <ModifyUser />}
                </div>
            </div>
        );
    }
}

class NewEvent extends React.Component {
    render() {
        return (
            <div>
                <p>NewEvent</p>
            </div>
        );
    }
}

class ModifyEvent extends React.Component {
    render() {
        return (
            <div>
                <p>ModifyEvent</p>
            </div>
        );
    }
}

class CreateUser extends React.Component {
    render() {
        return (
            <div>
                <p>CreateUser</p>
            </div>
        );
    }
}

class ModifyUser extends React.Component {
    render() {
        return (
            <div>
                <p>ModifyUser</p>
            </div>
        );
    }
}

export default Manage;
