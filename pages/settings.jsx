/*

This page has been adapted from Paper Dashboard React, v1.1.0, by Creative Tim.

=========================================================
* Paper Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

/*
 *  Portions of this page have been adapted from the Next.js example app
 *  with-cookie-auth, by ZEIT, Inc.
 *    https://github.com/zeit/next.js/tree/canary/examples/with-cookie-auth
 */

"use strict";

import React, { useState } from "react";
import {
  Container,
  Card,
  CardTitle,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  FormFeedback,
  FormText,
  Row,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import nextCookie from "next-cookies";
import fetch from "isomorphic-unfetch";
import { Router } from "next/router";

import Layout from "../components/layout";
import { withAuthSync, logout } from "../utils/auth";

function Settings({ token, userData }) {
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [updateNetworkErrors, setUpdateNetworkErrors] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteNetworkErrors, setDeleteNetworkErrors] = useState(false);
  const [deleteProhibited, setDeleteProhibited] = useState(false);

  const submitProfileUpdates = async (values, { resetForm, setFieldError }) => {
    // Remove `profile updated` or `network errors` if there
    setUpdated(false);
    setUpdateNetworkErrors(false);

    // Make sure password fields match
    if (values.newPassword != values.confirmNewPassword) {
      setFieldError("confirmNewPassword", "Oops, your passwords don't match!");
    } else {
      // Make sure there are actually updates to send
      let updates = {};
      if (values.username != userData.username) {
        updates.username = values.username;
      }
      if (values.newPassword) {
        updates.password = values.newPassword;
      }
      if (updates != {}) {
        // Put loading symbol on submit button
        setUpdating(true);

        try {
          // Send updates to API
          const response = await fetch("/api/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: token,
              updates: updates
            })
          });

          // Handle response from API
          if (response.status === 200) {
            // Update props with new user data
            delete updates.password;
            Object.assign(userData, updates);

            resetForm({
              values: {
                username: userData.username,
                newPassword: "",
                confirmNewPassword: ""
              }
            });
            setUpdated(true);
            setUpdating(false);
          } else if (response.status === 409) {
            setFieldError("username", "That username is already taken.");
            setUpdating(false);
          } else if (response.status === 401) {
            return logout();
          } else if (response.status === 403) {
            setFieldError(
              "username",
              "Changes to the demo account are prohibited."
            );
          } else {
            // https://github.com/developit/unfetch#caveats
            let error = new Error(response.statusText);
            error.response = response;
            throw error;
          }
        } catch (err) {
          console.error(
            "You have an error in your code or there are network issues.",
            err
          );
          setUpdateNetworkErrors(true);
        }

        setUpdating(false);
      }
    }
  };

  const toggleDeleteModal = () => {
    setDeleteModal(!deleteModal);
    setTimeout(setDeleteNetworkErrors, 1000, false); // Wait for modal animation to finish
    setTimeout(setDeleteProhibited, 1000, false);
  };

  const closeModalBtn = (
    <button className="close" onClick={toggleDeleteModal} disabled={deleting}>
      &times;
    </button>
  );

  const deleteAccount = async () => {
    setDeleting(true);

    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: token })
      });

      if (response.status === 200 || response.status === 401) {
        return logout();
      } else if (response.status === 403) {
        setDeleteProhibited(true);
      } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    } catch (err) {
      console.error(
        "You have an error in your code or there are network issues.",
        err
      );
      setDeleteNetworkErrors(true);
    }

    setDeleting(false);
  };

  return (
    <Layout pageTitle="Settings">
      <div className="content">
        <Container>
          <Card className="card-user">
            <CardHeader>
              <CardTitle tag="h5">Edit profile</CardTitle>
            </CardHeader>
            <CardBody>
              <Formik
                initialValues={{
                  username: userData.username,
                  newPassword: "",
                  confirmNewPassword: ""
                }}
                validationSchema={Yup.object({
                  username: Yup.string()
                    .matches(
                      /^\w+$/,
                      "Usernames can only consist of letters, numbers, and underscores."
                    )
                    .required("You need a username."),
                  newPassword: Yup.string(),
                  confirmNewPassword: Yup.string()
                })}
                onSubmit={submitProfileUpdates}
              >
                {formik => (
                  <Form noValidate onSubmit={formik.handleSubmit}>
                    <FormGroup>
                      <Label for="username">Username</Label>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText id="at-sign">@</InputGroupText>
                        </InputGroupAddon>
                        <Input
                          name="username"
                          id="username"
                          aria-describedby="at-sign"
                          type="text"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.username}
                          invalid={
                            formik.touched.username && !!formik.errors.username
                          }
                        />
                        <FormFeedback>{formik.errors.username}</FormFeedback>
                      </InputGroup>
                    </FormGroup>

                    <FormGroup>
                      <Label for="newPassword">New password</Label>
                      <Input
                        name="newPassword"
                        id="newPassword"
                        type="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.newPassword}
                        invalid={
                          formik.touched.password && !!formik.errors.password
                        }
                      />
                      <FormFeedback>{formik.errors.password}</FormFeedback>
                      <FormText color="muted">
                        Leave this blank if you don't want to change your
                        password.
                      </FormText>
                    </FormGroup>

                    <FormGroup>
                      <Label for="confirmNewPassword">
                        Confirm new password
                      </Label>
                      <Input
                        name="confirmNewPassword"
                        id="confirmNewPassword"
                        type="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmNewPassword}
                        invalid={
                          formik.touched.confirmNewPassword &&
                          formik.values.confirmNewPassword !=
                            formik.values.newPassword
                        }
                      />
                      <FormFeedback>
                        {formik.errors.retypePassword ||
                          "Oops, your passwords don't match!"}
                      </FormFeedback>
                    </FormGroup>

                    <Row>
                      <div className="update mx-auto">
                        <Button
                          className="btn-round"
                          color="primary"
                          type="submit"
                          disabled={updating}
                        >
                          {updating ? <Spinner size="sm" /> : "Update profile"}
                        </Button>
                      </div>
                    </Row>

                    {updated && (
                      <Row>
                        <div className="mx-auto text-success">
                          <i className="nc-icon nc-check-2" /> Your profile has
                          been updated!
                        </div>
                      </Row>
                    )}

                    {updateNetworkErrors && (
                      <Row>
                        <div className="mx-auto text-danger">
                          One of us is experiencing network errors 😞
                        </div>
                      </Row>
                    )}

                    <hr />

                    <div>
                      <Button
                        onClick={toggleDeleteModal}
                        color="link"
                        className="text-danger"
                      >
                        Delete your account.
                      </Button>
                    </div>
                    <Modal
                      isOpen={deleteModal}
                      centered
                      toggle={toggleDeleteModal}
                    >
                      <ModalHeader
                        toggle={toggleDeleteModal}
                        close={closeModalBtn}
                      >
                        Delete account
                      </ModalHeader>
                      <ModalBody>Are you sure? This can't be undone.</ModalBody>
                      <ModalFooter>
                        {deleteNetworkErrors || deleteProhibited ? (
                          <div className="text-danger">
                            {deleteNetworkErrors
                              ? "One of us is experiencing network errors 😞"
                              : "Deleting the demo account is prohibited."}
                          </div>
                        ) : (
                          <>
                            <Button
                              color="secondary"
                              onClick={toggleDeleteModal}
                              disabled={deleting}
                            >
                              Cancel
                            </Button>
                            <Button
                              color="danger"
                              onClick={deleteAccount}
                              disabled={deleting}
                            >
                              {deleting ? (
                                <Spinner size="sm" />
                              ) : (
                                "Yes, delete my account"
                              )}
                            </Button>
                          </>
                        )}
                      </ModalFooter>
                    </Modal>
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        </Container>
      </div>
    </Layout>
  );
}

// Get profile data for form
Settings.getInitialProps = async ctx => {
  // Grab user _id from auth cookie
  const { token } = nextCookie(ctx);

  try {
    // Ask for user data from profile API
    const response = await fetch(process.env.HOST + "/api/profile", {
      credentials: "include",
      headers: {
        authorization: JSON.stringify({ token })
      }
    });

    if (response.ok) {
      // Insert profile data into props
      const props = response.json();
      return props;
    } else {
      return logout();
    }
  } catch (err) {
    return logout();
  }
};

export default withAuthSync(Settings);
