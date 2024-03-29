import React, { useEffect, useContext, forwardRef, useState } from "react";
import { AppContext } from "../../../App";
import { firestore, auth, collectionData, docData } from "../../../config";

import {
  makeStyles,
  Container,
  Grid,
  Card,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import MaterialTable from "material-table";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { formatLocaleCurrency } from "country-currency-map/lib/formatCurrency";
import { navigate } from "@reach/router";
import { ajax } from "rxjs/ajax";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const useStyles = makeStyles((theme) => ({
  margintop: {
    marginTop: theme.spacing(5),
  },
}));

function DashboardAdmin() {
  const classes = useStyles();
  const { setIntro } = useContext(AppContext);
  const [totaldeposit, settotaldeposit] = useState();
  const [totalInvested, settotalInvested] = useState();
  const [totalpayout, settotalpayout] = useState();
  const [state, setState] = React.useState({
    columns: [
      { title: "Name", field: "firstName" },
      { title: "Surname", field: "lastName" },
      { title: "currency", field: "currencycode" },
      { title: "Wallet balance", field: "wallet_balance", type: "numeric" },
      { title: "Referred", field: "referrer" },
      { title: "Referrer Name", field: "referrername" },
      { title: "Email", field: "email" },
    ],
  });
  const [data, setdata] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const allusers = firestore
      .collection("users")
      .orderBy("registered", "desc");
    collectionData(allusers, "id").subscribe((data) => {
      data.forEach((dt, index) => {
        const getid = firestore.doc(`users/${dt.referrerid}`);
        docData(getid, "id").subscribe((vl) => {
          if (dt.referrer) {
            dt.referrername = `${vl.firstName} ${vl.lastName}`;
            dt.referreremail = vl.email;
          } else {
            dt.referrername = "";
            dt.referreremail = "";
          }

          setdata(data);
          console.log(data);
          navigate("");
        });
      });

      console.log(data);
    });

    const alldeposit = firestore.collection("alldeposits");
    const allinvestment = firestore
      .collection("alldeposits")
      .where("type", "==", "investment");
    const allpayout = firestore
      .collection("transactions")
      .where("complete", "==", true);

    // deposits
    collectionData(alldeposit, "id").subscribe((data) => {
      const totalDeposits = data.reduce((prv, cur) => {
        return prv + cur.deposit_amount;
      }, 0);
      settotaldeposit(
        totalDeposits
      );
    });

    // transaction payouts
    collectionData(allpayout, "id").subscribe((data) => {
      const totalpayouts = data.reduce((prv, cur) => {
        return prv + cur.return_amount;
      }, 0);
      settotalpayout(
        formatLocaleCurrency(totalpayouts, "USD", {
          autoFixed: false,
        })
      );
    });

    // investments
    collectionData(allinvestment, "id").subscribe((data) => {
      const totalinvest = data.reduce((prv, cur) => {
        return prv + cur.deposit_amount;
      }, 0);
      settotalInvested(
        formatLocaleCurrency(totalinvest, "USD", {
          autoFixed: false,
        })
      );
    });
  }, []);

  const balances = [
    { name: "Total Deposit", value: totaldeposit },
    { name: "Total Payouts", value: totalpayout },
    { name: "Total Invested", value: totalInvested },
  ];

  return (
    <Container>
      <Grid container spacing={5} justify="center">
        {balances.map((bal, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card variant="outlined">
              <ListItem>
                <ListItemText
                  primary={bal.name}
                  secondary={<Typography variant="h6">{bal.value}</Typography>}
                />
              </ListItem>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={12}>
          <MaterialTable
            icons={tableIcons}
            title="Registered users"
            columns={state.columns}
            data={data}
            editable={{
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    setState((prevState) => {
                      const data = [...prevState.data];
                      data.push(newData);
                      return { ...prevState, data };
                    });
                  }, 600);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    if (newData.wallet_balance) {
                      console.log(newData);
                      firestore.doc(`users/${newData.id}`).update({
                        wallet_balance: newData.wallet_balance,
                      });
                    } else {
                      console.log("none");
                    }
                  }, 1000);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    ajax({
                      url: "https://us-central1-bchunters-9ea45.cloudfunctions.net/skimasite/delete",
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: {
                        uid: oldData.id,
                      },
                    }).subscribe(() => {
                      firestore
                        .doc(`users/${oldData.id}`)
                        .delete()
                        .then(() => console.log("deleted"));
                    });
                  }, 600);
                }),
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardAdmin;
